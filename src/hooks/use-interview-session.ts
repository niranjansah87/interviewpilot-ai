'use client';

/**
 * Interview Session Hook — orchestrates the complete interview lifecycle.
 * This is the main hook consumed by the interview runtime UI.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import type { ConversationState, InterviewConfig, InterviewContext, ConversationTurn } from '@/lib/conversation/engine';
import { createInterviewContext, transition, decideFollowUp, selectNextTopic } from '@/lib/conversation/engine';
import { composeSystemPrompt, composeClosingPrompt, estimatePromptTokens } from '@/lib/conversation/prompt-engine';

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

      const composedPrompt = composeSystemPrompt(ctx);

      // TODO: Call AI provider to create session + connect
      // const session = await aiProvider.createRealtimeSession({
      //   model: 'gpt-4o-realtime-preview',
      //   instructions: composedPrompt,
      // });
      // const conn = await aiProvider.connectToSession(session.id, handleAIEvent);

      setStatus('connected');
      updateCtx('connected');

      // For now, simulate with a mock
      addTranscription('interviewer', 'Hello! Thank you for joining me today.', false);
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
            addTranscription('interviewer', event.transcript, false);
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

    // const closingPrompt = composeClosingPrompt(ctx);
    // await connection.sendText(closingPrompt);
    connectionRef.current?.close();

    // TODO: Persist session + transcript to DB
    // await fetch(`/api/v1/interviews/${sessionId}`, { method: 'PATCH', ... });
  }, [updateCtx, sessionId]);

  // ---- Recovery ----

  const handleReconnect = useCallback(async () => {
    setStatus('reconnecting');
    try {
      await startInterview();
    } catch {
      setError('Reconnection failed. Your progress has been saved.');
    }
  }, [startInterview]);

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
    endInterview,
    handleReconnect,
    addTranscription,
  };
}
