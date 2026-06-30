'use client';

/**
 * Interview Session Hook — orchestrates the complete interview lifecycle.
 * This is the main hook consumed by the interview runtime UI.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import type { ConversationState, InterviewConfig, InterviewContext, ConversationTurn } from '@/lib/conversation/engine';
import { createInterviewContext, transition, decideFollowUp, selectNextTopic } from '@/lib/conversation/engine';
import { composeSystemPrompt, composeClosingPrompt, estimatePromptTokens } from '@/lib/conversation/prompt-engine';
import { logger } from '@/monitoring/logger';
import { audioRuntime } from '@/lib/audio/runtime';
const aiLogger = logger.child({ component: 'interview-session' });

export interface InterviewSessionState {
  context: InterviewContext;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'reconnecting';
  micPermission: 'prompt' | 'granted' | 'denied' | 'unavailable';
  transcription: TranscriptionEntry[];
  currentPartialTranscript: string;
  speaker: 'interviewer' | 'candidate' | null;
  aiSpeaking: boolean;
  error: string | null;
  durationSeconds: number;
}

export interface TranscriptionEntry {
  id: string;
  role: 'interviewer' | 'candidate';
  text: string;
  timestamp: Date;
  isPartial: boolean;
}

const DEFAULT_CONFIG: InterviewConfig = {
  type: 'behavioral',
  targetRole: 'Software Engineer',
  experienceLevel: 'mid',
  maxDurationSeconds: 30 * 60,
  maxQuestions: 10,
};

export function useInterviewSession(sessionId: string, config: Partial<InterviewConfig> = {}) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  const [ctx, setCtx] = useState<InterviewContext>(() =>
    createInterviewContext(sessionId, mergedConfig),
  );
  const [status, setStatus] = useState<InterviewSessionState['connectionStatus']>('disconnected');
  const [mic, setMic] = useState<InterviewSessionState['micPermission']>('prompt');
  const [transcription, setTranscription] = useState<TranscriptionEntry[]>([]);
  const [partial, setPartial] = useState('');
  const [speaker, setSpeaker] = useState<InterviewSessionState['speaker']>(null);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [micStream, setMicStream] = useState<MediaStream | null>(null);

  const connectionRef = useRef<any>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const captureCtxRef = useRef<AudioContext | null>(null); // Mic capture context
  const playbackCtxRef = useRef<AudioContext | null>(null); // AI audio playback context
  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ---- Barge-in: stop current AI audio when candidate speaks ----
  const stopPlayback = useCallback(() => {
    try {
      activeSourceRef.current?.stop();
    } catch { /* already stopped */ }
    activeSourceRef.current = null;
    setAiSpeaking(false);
    console.log('[BargeIn] Stopped current audio source');
  }, []);

  // ---- Duration Timer ----

  useEffect(() => {
    if (status === 'connected') {
      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  // ---- State Transitions ----

  const updateCtx = useCallback((event: Parameters<typeof transition>[1]) => {
    setCtx((prev) => {
      const nextState = transition(prev.state, event);
      return { ...prev, state: nextState, lastActivityAt: new Date() };
    });
  }, []);

  // ---- Microphone ----

  const requestMic = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMic('granted');
      setMicStream(stream);
      await audioRuntime.start(stream);
      return stream;
    } catch {
      setMic('denied');
      setError('Microphone permission denied. Voice interviews require a microphone.');
      return null;
    }
  }, []);

  // ---- Start Interview ----

  const startInterview = useCallback(async () => {
    updateCtx('start');
    setStatus('connecting');
    setError(null);

    try {
      const stream = await requestMic();
      if (!stream) {
        updateCtx('error');
        return;
      }

      // Fetch user profile + resume for context
      let candidateName = '';
      let resumeContext = '';
      try {
        const [profileRes, resumeRes] = await Promise.all([
          fetch('/api/v1/users/me', { credentials: 'include' }),
          fetch('/api/v1/users/me/resume', { credentials: 'include' }),
        ]);
        if (profileRes.ok) {
          const { data: profile } = await profileRes.json();
          candidateName = profile.name ?? '';
        }
        if (resumeRes.ok) {
          const { data: resume } = await resumeRes.json();
          if (resume?.text) resumeContext = resume.text.slice(0, 3000);
        }
      } catch { /* non-critical */ }

      // Connect to voice provider via server-side API (keeps keys safe)
      let providerError = '';
      try {
        const res = await fetch('/api/v1/voice/connect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            interview_type: ctx.config.type,
            role: ctx.config.targetRole,
            level: ctx.config.experienceLevel,
            candidate_name: candidateName,
            resume_context: resumeContext,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error((err as { detail?: string }).detail ?? `Voice API returned ${res.status}`);
        }

        const { data } = await res.json() as { data: { signedUrl: string; dynamicVars?: Record<string, string> } };
        const { signedUrl, dynamicVars } = data;

        // Connect WebSocket direct to ElevenLabs (browser-to-ElevenLabs, low latency)
        const ws = new WebSocket(signedUrl);
        const conn = createWebSocketConnection(ws, handleAIEvent, {
          onDisconnect: (reason) => {
            setStatus('disconnected');
            setError(`Interview paused: ${reason}. Click reconnect to continue.`);
          },
          onUserSpeech: () => { stopPlayback(); setSpeaker('candidate'); },
        });
        (connectionRef as React.MutableRefObject<unknown>).current = conn;

        // Wait for WebSocket to open
        await new Promise<void>((resolve, reject) => {
          ws.onopen = () => resolve();
          ws.onerror = () => reject(new Error('WebSocket connection failed'));
          setTimeout(() => reject(new Error('WebSocket connection timed out')), 10000);
        });

        aiLogger.info({ msg: 'Connected to ElevenLabs via signed URL' });

        // Capture PCM 16kHz mono audio (ElevenLabs expects this format)
        const audioCtx = new AudioContext({ sampleRate: 16000 });
        (captureCtxRef as React.MutableRefObject<AudioContext | null>).current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const processor = audioCtx.createScriptProcessor(4096, 1, 1);
        (processorRef as React.MutableRefObject<ScriptProcessorNode | null>).current = processor;

        let micChunks = 0;
        processor.onaudioprocess = (e) => {
          if (ws.readyState === WebSocket.OPEN) {
            micChunks++;
            if (micChunks % 10 === 1) console.log('[Mic] sending chunk #' + micChunks);
            const inputData = e.inputBuffer.getChannelData(0);
            const pcm = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
              pcm[i] = Math.max(-32768, Math.min(32767, Math.round(inputData[i]! * 32767)));
            }
            // ElevenLabs expects audio as base64 JSON, same format as they send
            const bytes = new Uint8Array(pcm.buffer);
            let binary = '';
            for (let i = 0; i < bytes.length; i++) {
              binary += String.fromCharCode(bytes[i]!);
            }
            const base64 = btoa(binary);
            ws.send(JSON.stringify({ user_audio_chunk: base64 }));
          }
        };
        source.connect(processor);
        // Connect to a silent gain node to keep processor alive without feedback
        const silenceGain = audioCtx.createGain();
        silenceGain.gain.value = 0;
        processor.connect(silenceGain);
        silenceGain.connect(audioCtx.destination);

        // Send candidate context IMMEDIATELY — before agent starts speaking
        // This way the agent knows who the candidate is from the first message
        const name = candidateName || 'the candidate';
        const type = ctx.config.type ?? 'behavioral';
        const role = ctx.config.targetRole ?? 'this position';
        const level = ctx.config.experienceLevel ?? 'mid';
        const resume = resumeContext ? ` Resume: ${resumeContext.slice(0, 2000)}` : '';

        const contextMessage = `[CANDIDATE CONTEXT — Use this for the entire interview]
Name: ${name}
Interview Type: ${type}
Target Role: ${role}
Experience Level: ${level}${resume}

Address the candidate by name in your first message. Personalize every question to this role and level. Reference their resume experience.`;

        ws.send(JSON.stringify({
          type: 'contextual_update',
          text: contextMessage,
        }));

        // Then trigger the agent to start (after a short delay to let context process)
        setTimeout(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'conversation_initiation_client_data',
              conversation_initiation_client_data_event: {},
            }));
          }
        }, 500);
      } catch (err) {
        providerError = err instanceof Error ? err.message : String(err);
        aiLogger.error({ msg: 'AI provider connection failed', error: providerError });
        setError(`Voice provider unavailable: ${providerError}. Click below to try demo mode instead.`);
        updateCtx('error');
        setStatus('disconnected');
        return;
      }

      setStatus('connected');
      updateCtx('connected');
      setSpeaker('interviewer');

      // Mark interview as active
      try {
        await fetch(`/api/v1/interviews/${sessionId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ status: 'ACTIVE' }),
        });
      } catch { /* non-critical */ }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start interview');
      updateCtx('error');
      setStatus('disconnected');
    }
  }, [ctx, requestMic, updateCtx]);

  // ---- Handle AI Events ----

  const handleAIEvent = useCallback(
    (event: any) => {
      switch (event.type) {
        case 'input_audio_buffer.speech_started':
          setSpeaker('candidate');
          updateCtx('speech_started');
          // Barge-in: stop AI audio immediately + send interrupt to provider
          stopPlayback();
          try {
            const conn = connectionRef.current;
            if (conn?.ws?.readyState === WebSocket.OPEN || conn?.ws?.readyState === 1) {
              conn.ws.send(JSON.stringify({ type: 'interrupt' }));
            } else if (typeof conn?.interrupt === 'function') {
              conn.interrupt();
            }
          } catch { /* best effort */ }
          break;

        case 'input_audio_buffer.speech_stopped':
          updateCtx('speech_stopped');
          break;

        case 'response.audio_transcript.delta':
          setPartial((p) => p + (event.delta ?? ''));
          setAiSpeaking(true);
          setSpeaker('interviewer');
          break;

        case 'response.audio_transcript.done':
          if (event.transcript) {
            addTranscription(event.role ?? 'interviewer', event.transcript, false);
            setPartial('');
            // Save transcript to database
            fetch(`/api/v1/interviews/${sessionId}/transcript`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ role: event.role ?? 'interviewer', content: event.transcript }),
            }).catch(() => {});
          }
          updateCtx('response_completed');
          setAiSpeaking(false);

          // Decide next action
          const decision = decideFollowUp(ctx);
          if (decision === 'conclude') {
            endInterview();
          } else if (decision === 'transition') {
            const nextTopic = selectNextTopic(ctx);
            setCtx((prev) => ({
              ...prev,
              currentTopic: nextTopic,
              topicHistory: [...prev.topicHistory, nextTopic],
              followUpDepth: 0,
              questionCount: prev.questionCount + 1,
            }));
          } else {
            setCtx((prev) => ({
              ...prev,
              followUpDepth: prev.followUpDepth + 1,
            }));
          }
          break;

        case 'error':
          setError(event.error?.message ?? 'AI service error');
          break;
      }
    },
    [ctx, updateCtx],
  );

  // ---- Transcript ----

  const addTranscription = useCallback(
    (role: 'interviewer' | 'candidate', text: string, isPartial: boolean) => {
      const entry: TranscriptionEntry = {
        id: crypto.randomUUID?.() ?? Date.now().toString(36),
        role,
        text,
        timestamp: new Date(),
        isPartial,
      };
      setTranscription((prev) => [...prev, entry]);
    },
    [],
  );

  // ---- End Interview ----

  const endInterview = useCallback(async () => {
    updateCtx('end');
    setStatus('disconnected');

    // Kill all audio immediately — stop AI speaking + close mic
    stopPlayback();
    processorRef.current?.disconnect();
    captureCtxRef.current?.close();
    audioRuntime.stop().catch(() => {});
    connectionRef.current?.close();
    console.log('[EndInterview] Stopped playback, closed mic, closed connection');

    // Persist interview status
    try {
      const res = await fetch(`/api/v1/interviews/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          status: 'COMPLETED',
          durationSeconds: duration,
        }),
      });
      if (!res.ok) {
        console.error('[endInterview] PATCH failed:', res.status, await res.text());
      } else {
        console.log('[endInterview] Status updated to COMPLETED, duration:', duration);
      }
    } catch (err) {
      console.error('[endInterview] PATCH error:', err);
    }
  }, [updateCtx, sessionId, duration]);

  // ---- Recovery ----

  const handleReconnect = useCallback(async () => {
    setStatus('reconnecting');
    try {
      await startInterview();
    } catch {
      setError('Reconnection failed. Your progress has been saved.');
    }
  }, [startInterview]);

  // ---- Demo Mode (explicit opt-in, not silent fallback) ----
  const startDemo = useCallback(async () => {
    const stream = await requestMic();
    if (!stream) return;

    updateCtx('start');
    setStatus('connecting');
    setError(null);

    // Small delay to show connecting state
    await new Promise((r) => setTimeout(r, 500));
    setStatus('connected');
    updateCtx('connected');
    setSpeaker('interviewer');

    const intro = 'Hello! Welcome to InterviewPilot AI Demo Mode. This is a simulated ' +
      ctx.config.type + ' interview. The AI responses are pre-scripted for demonstration purposes. ' +
      'Tell me about your background and experience.';
    addTranscription('interviewer', intro, false);

    // Simulated follow-ups
    setTimeout(() => {
      setSpeaker('candidate');
      addTranscription('candidate', 'I have experience building full-stack applications with modern technologies. I have worked on several projects involving distributed systems and cloud architecture.', false);
    }, 3000);
    setTimeout(() => {
      setSpeaker('interviewer');
      addTranscription('interviewer', 'Interesting. Can you describe a specific project where you had to make a difficult architectural decision? What were the trade-offs you considered?', false);
    }, 8000);
  }, [ctx.config.type, ctx.config.targetRole, requestMic, updateCtx, addTranscription]);

  return {
    // State
    state: ctx.state,
    config: mergedConfig,
    connectionStatus: status,
    micPermission: mic,
    transcription,
    currentPartial: partial,
    speaker,
    aiSpeaking,
    error,
    durationSeconds: duration,
    micStream,
    tokenEstimate: estimatePromptTokens(ctx),

    // Actions
    requestMic,
    startInterview,
    startDemoMode: startDemo,
    endInterview,
    handleReconnect,
    addTranscription,
  };
}

// ---- Browser WebSocket connection helper ----

interface WSConnection {
  sendAudio(chunk: ArrayBuffer): void;
  sendText(text: string): void;
  interrupt(): void;
  close(): void;
}

function createWebSocketConnection(
  ws: WebSocket,
  onEvent: (event: Record<string, unknown>) => void,
  callbacks: {
    onDisconnect: (reason: string) => void;
    onUserSpeech: () => void;
  },
): WSConnection {
  let activeSource: AudioBufferSourceNode | null = null;
  let audioCtx: AudioContext | null = null;
  let nextAudioTime = 0;

  function getAudioCtx(): AudioContext {
    // Prefer shared runtime context (enables speaker visualization)
    if (audioRuntime.getContext()) return audioRuntime.getContext()!;
    if (!audioCtx) audioCtx = new AudioContext({ sampleRate: 16000 });
    return audioCtx;
  }

  function playPCM16(buffer: ArrayBuffer) {
    try {
      const ctx = getAudioCtx();
      const pcm = new Int16Array(buffer);
      const float32 = new Float32Array(pcm.length);
      for (let i = 0; i < pcm.length; i++) {
        float32[i] = pcm[i]! / 32768;
      }
      const audioBuffer = ctx.createBuffer(1, float32.length, 16000);
      audioBuffer.getChannelData(0).set(float32);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      // Route through shared runtime so speaker analyser picks it up
      const gainNode = audioRuntime.getSpeakerGain();
      source.connect(gainNode ?? ctx.destination);

      // Track current source for barge-in
      activeSource = source;
      source.onended = () => {
        if (activeSource === source) {
          activeSource = null;
        }
      };

      const now = ctx.currentTime;
      if (nextAudioTime < now) nextAudioTime = now;
      source.start(nextAudioTime);
      nextAudioTime += audioBuffer.duration;
    } catch { /* skip bad audio */ }
  }

  ws.binaryType = 'arraybuffer';

  let msgCount = 0;

  ws.onmessage = (msg) => {
    msgCount++;
    if (msg.data instanceof ArrayBuffer) {
      console.log('[WS] recv audio chunk', msg.data.byteLength, 'bytes');
      playPCM16(msg.data);
      return;
    }
    if (msg.data instanceof Blob) {
      console.log('[WS] recv audio blob', (msg.data as Blob).size, 'bytes');
      (msg.data as Blob).arrayBuffer().then(buf => playPCM16(buf));
      return;
    }
    try {
      const parsed = JSON.parse(msg.data as string);
      console.log('[WS] event #' + msgCount + ':', parsed.type);
      switch (parsed.type) {
        case 'conversation_initiation_metadata':
          console.log('[WS] session init metadata');
          break;
        case 'audio':
          if (parsed.audio_event?.audio_base_64) {
            const raw = atob(parsed.audio_event.audio_base_64);
            const bytes = new Uint8Array(raw.length);
            for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
            console.log('[WS] audio event,', bytes.length, 'bytes PCM');
            playPCM16(bytes.buffer);
          }
          break;
        case 'agent_response':
          if (parsed.agent_response_event?.agent_response) {
            console.log('[WS] agent:', parsed.agent_response_event.agent_response);
            onEvent({ type: 'response.audio_transcript.done', role: 'interviewer', transcript: parsed.agent_response_event.agent_response });
          }
          break;
        case 'user_transcript':
          if (parsed.user_transcription_event?.user_transcript) {
            console.log('[WS] user:', parsed.user_transcription_event.user_transcript);
            onEvent({ type: 'response.audio_transcript.done', role: 'candidate', transcript: parsed.user_transcription_event.user_transcript });
          }
          break;
        case 'agent_transcript':
          if (parsed.agent_transcription_event?.agent_transcript) {
            console.log('[WS] agent transcript:', parsed.agent_transcription_event.agent_transcript);
            onEvent({ type: 'response.audio_transcript.done', role: 'interviewer', transcript: parsed.agent_transcription_event.agent_transcript });
          }
          break;
        case 'user_started_speaking':
          console.log('[WS] USER STARTED SPEAKING — barge-in!');
          callbacks.onUserSpeech();
          nextAudioTime = 0;
          break;
        case 'interruption':
          console.log('[WS] INTERRUPTION from server');
          callbacks.onUserSpeech();
          nextAudioTime = 0;
          break;
        case 'ping':
          if (parsed.ping_event?.event_id) {
            ws.send(JSON.stringify({ type: 'pong', event_id: parsed.ping_event.event_id }));
          }
          break;
        case 'session_timeout':
        case 'conversation_ended':
        case 'agent_disconnected':
          callbacks.onDisconnect('Interview session ended — perhaps due to extended silence');
          break;
      }
    } catch { /* ignore */ }
  };

  ws.onclose = () => callbacks.onDisconnect('Connection closed');
  ws.onerror = () => {};

  return {
    sendAudio(chunk: ArrayBuffer) {
      if (ws.readyState === WebSocket.OPEN) ws.send(chunk);
    },
    sendText(_text: string) {},
    interrupt() {
      if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: 'interrupt' }));
    },
    close() {
      audioCtx?.close();
      audioCtx = null;
      ws.close();
    },
  };
}
