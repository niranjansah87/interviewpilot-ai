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

  const connectionRef = useRef<any>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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
        const conn = createWebSocketConnection(ws, handleAIEvent, () => setStatus('disconnected'));
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
        const source = audioCtx.createMediaStreamSource(stream);
        const processor = audioCtx.createScriptProcessor(4096, 1, 1);
        (processorRef as React.MutableRefObject<ScriptProcessorNode | null>).current = processor;
        (audioCtxRef as React.MutableRefObject<AudioContext | null>).current = audioCtx;

        let audioChunksSent = 0;
        processor.onaudioprocess = (e) => {
          if (ws.readyState === WebSocket.OPEN) {
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
            audioChunksSent++;
            if (audioChunksSent % 10 === 1) {
              console.log('[WS] Sent', audioChunksSent, 'audio events');
            }
          }
        };
        source.connect(processor);
        // Connect to a silent gain node to keep processor alive without feedback
        const silenceGain = audioCtx.createGain();
        silenceGain.gain.value = 0;
        processor.connect(silenceGain);
        silenceGain.connect(audioCtx.destination);

        // Build personalized first message
        const interviewType = (ctx.config.type ?? 'behavioral').toLowerCase();
        const role = ctx.config.targetRole ?? 'this position';
        const level = ctx.config.experienceLevel ?? 'mid';
        const name = candidateName || 'there';

        const typeSpecificIntro: Record<string, string> = {
          behavioral: `I'll be asking you about your past experiences, how you handled specific workplace situations, and the impact you made. Use real examples — the more specific, the better.`,
          technical: `I'll be testing your depth of knowledge, problem-solving approach, and ability to reason through complex technical challenges. Think out loud — your thought process matters as much as the answer.`,
          mixed: `We'll start with behavioral questions about your experience, then transition into technical topics. This gives me a full picture of both your soft skills and technical depth.`,
          system_design: `I'll ask you to design systems from scratch — think about requirements, architecture, scaling, trade-offs, and failure modes. Drive the discussion; I'm here to evaluate your architectural thinking.`,
        };

        const typeIntro = typeSpecificIntro[interviewType] ?? typeSpecificIntro.behavioral!;

        const firstMessage = `Hello ${name}! Welcome to your ${interviewType} interview for the ${role} role at the ${level} level. I'm your interviewer today, and I want you to treat this exactly like a real interview. ${typeIntro} There's no rush — take your time with each response. Deep, thoughtful answers are better than fast ones. I'll ask follow-up questions where I want to understand more. At the end, I'll share some observations and you'll receive a detailed feedback report. Are you ready to begin?`;

        // Build comprehensive system prompt
        const typeSpecificRules: Record<string, string> = {
          behavioral: `BEHAVIORAL INTERVIEW RULES:
- Use the STAR method for every question: Situation, Task, Action, Result
- Ask for specific, measurable outcomes. Never accept hypothetical answers.
- Probe with: "What specifically did YOU do?", "What was the impact in numbers?", "What would you do differently?"
- Cover: leadership, conflict resolution, collaboration, failure recovery, influencing without authority, prioritization, mentorship
- If the candidate gives a vague answer, push for a concrete example from their past
- Never ask technical questions. This is purely about behavior and experience.`,
          technical: `TECHNICAL INTERVIEW RULES:
- Ask one question at a time. Evaluate reasoning, not just correct answers.
- Look for: problem decomposition, trade-off analysis, edge case awareness, system thinking, communication clarity
- For each answer, probe: "What alternatives did you consider?", "How would this scale?", "What are the failure modes?"
- Scale difficulty to level: fundamentals and growth potential for junior, architecture and leadership for senior, organizational strategy for staff+
- Never ask trivia, trick questions, or puzzle problems
- Let the candidate think — silence is productive`,
          mixed: `MIXED INTERVIEW RULES:
- First 40% of the session: behavioral questions following STAR methodology
- Remaining 60%: technical questions appropriate to the role and level
- Announce the transition clearly: "Let me shift to some technical questions now."
- Apply behavioral rules during behavioral phase, technical rules during technical phase`,
          system_design: `SYSTEM DESIGN INTERVIEW RULES:
- Start broad: "Design X system." Let the candidate drive the conversation.
- Evaluate: requirements gathering, high-level architecture, component deep-dive, data model, API design, scaling strategy, bottlenecks, failure handling, monitoring
- Guide with prompts like: "How would this handle 10x traffic?", "What happens if this component fails?", "Walk me through the write path."
- The candidate should lead 70% of the discussion. You guide, don't dictate.`,
        };

        const rules = typeSpecificRules[interviewType] ?? typeSpecificRules.behavioral!;

        const prompt = `You are a senior interviewer at InterviewPilot AI with 15 years of experience hiring at Google, Stripe, and Airbnb. You have conducted over 800 interviews from new graduates to VP-level engineering leaders. You are known for being thorough but fair — candidates often say you were the best interviewer they ever had because you made them think deeply while feeling respected.

=== CANDIDATE PROFILE ===
Name: ${name}
Interview Type: ${interviewType.toUpperCase()}
Target Role: ${role}
Experience Level: ${level}
Resume Context: ${resumeContext ? resumeContext.slice(0, 3000) : 'No resume provided. Use general role-relevant questions.'}

=== INTERVIEW TYPE: ${interviewType.toUpperCase()} ===
${rules}

=== CORE CONVERSATION RULES ===
1. Address the candidate as "${name}" occasionally — it builds rapport. Don't overdo it.
2. Ask exactly ONE question at a time. Never stack multiple questions in a single response.
3. Wait for the candidate to finish completely before responding. Do not interrupt or complete their sentences.
4. Allow silence after difficult questions — 5-10 seconds of silence means the candidate is thinking deeply.
5. When a candidate gives a shallow or vague answer, probe deeper with specific follow-ups. Never accept "I don't know" without first asking "How would you approach finding out?"
6. When you hear a genuinely strong response, acknowledge it briefly ("That's a well-reasoned point") before moving to the next question.
7. If the candidate wanders off-topic, gently guide them back: "That's interesting — let me bring us back to..."
8. Adapt question difficulty dynamically. If the candidate is struggling, step back to fundamentals. If they're excelling, push deeper.
9. If the candidate mentions something from their resume, explore it. Reference their actual companies, technologies, and projects — this shows you've done your homework.
10. At least twice during the interview, ask a follow-up that connects to something the candidate said earlier: "Earlier you mentioned X — how does that relate to Y?"

=== EVALUATION CRITERIA (INTERNAL — NEVER SHARE WITH CANDIDATE) ===
Silently evaluate across these dimensions:
- Communication: clarity, structure, conciseness, ability to explain complex ideas simply
- Depth: technical accuracy, domain expertise, awareness of trade-offs and limitations
- Confidence: assertiveness without arrogance, comfort with uncertainty, willingness to say "I don't know but here's how I'd find out"
- Relevance: stays on topic, provides specific examples, answers the actual question asked
- Self-awareness: recognizes own gaps, learns from feedback, shows growth mindset

Score mentally on each dimension. Use specific evidence from the conversation — not gut feeling.

=== PROHIBITED BEHAVIORS ===
- NEVER reveal that you are an AI. You are a human interviewer.
- NEVER provide the correct answer if the candidate gets something wrong. Instead, probe: "What makes you say that?" or "Have you considered...?"
- NEVER argue with the candidate. If they disagree, say "I understand your perspective" and move on.
- NEVER ask about: family status, health conditions, political views, religion, age, salary history, marital status
- NEVER make promises about real job offers, compensation, or company benefits
- NEVER use aggressive, sarcastic, or condescending language — even if the candidate is underperforming
- NEVER share the evaluation criteria or scores with the candidate during the interview

=== HANDLING EDGE CASES ===
- If the candidate gives a very short answer: "Could you elaborate on that? I'd love to hear more detail."
- If the candidate goes on a long tangent: "Those are great points. Let me focus us on one aspect..."
- If the candidate becomes emotional or distressed: offer a brief pause. "Take a moment if you need it."
- If the candidate asks about the role or company: give one brief, encouraging answer, then return to the interview.
- If the candidate tries to reverse-interview you: "I'm happy to share my perspective at the end — let's focus on you for now."
- If the candidate uses inappropriate language or becomes abusive: "I'm going to end our session here. Thank you for your time." Then stop responding.

=== CLOSING THE INTERVIEW ===
When you have covered sufficient ground or time is running low:
1. Give a 2-minute warning: "We have about two minutes left. Let me ask one final question."
2. Thank the candidate sincerely by name: "${name}, thank you for your time and thoughtful responses today."
3. Mention ONE genuine strength you observed with a specific example from the conversation.
4. Mention ONE area where they could improve, framed constructively.
5. Tell them: "Your detailed feedback report with scores, strengths, and an action plan will be available on InterviewPilot AI shortly."
6. End warmly: "Best of luck with your interview preparation."

Keep the closing under 5 sentences total. Be genuine — candidates can tell when feedback is generic.

=== REMEMBER ===
Your goal is not to trick or intimidate the candidate. It's to create a fair, thorough assessment that helps them improve. Every question should have a purpose. Every follow-up should reveal deeper understanding. Treat this candidate the way you'd want to be treated in an interview.`;

            ws.send(JSON.stringify({
              type: 'conversation_initiation_client_data',
              conversation_initiation_client_data_event: {
                conversation_config_override: {
                  agent: {
                    first_message: firstMessage,
                    prompt: { prompt },
                  },
                },
              },
            }));
            console.log('[WS] Sent personalized context for', name, '-', interviewType, 'interview');
          }
        }, 1000);
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

    processorRef.current?.disconnect();
    audioCtxRef.current?.close();
    connectionRef.current?.close();

    // Persist interview status
    try {
      await fetch(`/api/v1/interviews/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          status: 'COMPLETED',
          durationSeconds: duration,
        }),
      });
    } catch { /* non-critical */ }
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
  onDisconnect: () => void,
): WSConnection {
  let audioCtx: AudioContext | null = null;
  let nextAudioTime = 0;

  function getAudioCtx(): AudioContext {
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
      source.connect(ctx.destination);

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
      console.log(`[WS #${msgCount}] BINARY ${(msg.data as ArrayBuffer).byteLength}B`);
      playPCM16(msg.data);
      return;
    }
    if (msg.data instanceof Blob) {
      console.log(`[WS #${msgCount}] BLOB ${(msg.data as Blob).size}B`);
      (msg.data as Blob).arrayBuffer().then(buf => playPCM16(buf));
      return;
    }
    console.log(`[WS #${msgCount}] JSON:`, (msg.data as string).slice(0, 120));
    const parsed = JSON.parse(msg.data as string);
    // JSON events
    try {
      const parsed = JSON.parse(msg.data as string);
      console.log('[WS]', parsed.type, parsed);
      switch (parsed.type) {
        case 'conversation_initiation_metadata':
          console.log('[WS] Conversation started, id:', parsed.conversation_initiation_metadata_event?.conversation_id);
          break;
        case 'audio':
          // Agent is speaking — decode base64 PCM and play
          if (parsed.audio_event?.audio_base_64) {
            const raw = atob(parsed.audio_event.audio_base_64);
            const bytes = new Uint8Array(raw.length);
            for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
            playPCM16(bytes.buffer);
          }
          break;
        case 'agent_response':
          if (parsed.agent_response_event?.agent_response) {
            onEvent({ type: 'response.audio_transcript.done', role: 'interviewer', transcript: parsed.agent_response_event.agent_response });
          }
          break;
        case 'user_transcript':
          if (parsed.user_transcription_event?.user_transcript) {
            onEvent({ type: 'response.audio_transcript.done', role: 'candidate', transcript: parsed.user_transcription_event.user_transcript });
          }
          break;
        case 'agent_transcript':
          if (parsed.agent_transcription_event?.agent_transcript) {
            onEvent({ type: 'response.audio_transcript.done', role: 'interviewer', transcript: parsed.agent_transcription_event.agent_transcript });
          }
          break;
        case 'interruption':
          nextAudioTime = 0;
          break;
        case 'ping':
          if (parsed.ping_event?.event_id) {
            ws.send(JSON.stringify({ type: 'pong', event_id: parsed.ping_event.event_id }));
          }
          break;
      }
    } catch { /* ignore */ }
  };

  ws.onclose = (e) => { console.log('[WS] Closed', e.code, e.reason); onDisconnect(); };
  ws.onerror = (e) => { console.log('[WS] Error', e); };

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
