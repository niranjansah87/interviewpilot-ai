/**
 * AI Provider interface — the abstraction layer for all AI interactions.
 * All voice, conversation, and feedback generation goes through this contract.
 * Switching providers requires only a new adapter.
 */

// ---- Connection Lifecycle ----

// Available OpenAI Realtime models
// See: https://platform.openai.com/docs/models#realtime
export type RealtimeModel =
| 'gpt-4o-realtime-preview-2025-06-03'    // Deprecated — use 'gpt-4o-realtime-preview'
| 'gpt-4o-realtime-preview-2024-12-17'
  | 'gpt-4o-realtime-preview'               // Latest snapshot
  | 'gpt-4o-realtime-preview-2024-10-01';

export interface RealtimeSessionConfig {
  model: RealtimeModel;
  instructions: string;
  voice?: 'alloy' | 'ash' | 'ballad' | 'coral' | 'echo' | 'sage' | 'shimmer' | 'verse';
  temperature?: number;
  maxResponseOutputTokens?: number;
  inputAudioTranscription?: { model: 'whisper-1' };
  turnDetection?: {
    type: 'server_vad';
    threshold?: number;
    prefixPaddingMs?: number;
    silenceDurationMs?: number;
  };
  /** Dynamic variables passed to ElevenLabs agent for session personalization */
  type?: string;
  targetRole?: string;
  experienceLevel?: string;
  candidateName?: string;
}

export interface RealtimeSession {
  id: string;
  status: 'connecting' | 'connected' | 'disconnecting' | 'disconnected';
  model: string;
  expiresAt: Date;
}

export type RealtimeEventType =
  | 'session.created'
  | 'session.updated'
  | 'conversation.item.created'
  | 'conversation.item.input_audio_transcription.completed'
  | 'response.audio.delta'
  | 'response.audio.done'
  | 'response.audio_transcript.delta'
  | 'response.audio_transcript.done'
  | 'response.text.delta'
  | 'response.text.done'
  | 'response.done'
  | 'input_audio_buffer.speech_started'
  | 'input_audio_buffer.speech_stopped'
  | 'input_audio_buffer.committed'
  | 'error';

export interface RealtimeEvent {
  type: RealtimeEventType;
  event_id?: string;
  response_id?: string;
  item_id?: string;
  transcript?: string;
  text?: string;
  delta?: string;
  audio?: ArrayBuffer;
  error?: { type: string; message: string; code?: string };
}

export type RealtimeEventHandler = (event: RealtimeEvent) => void;

// ---- Provider Interface ----

export interface AIProvider {
  /** Provider identifier for logging/metrics */
  readonly name: string;

  /** Create a new realtime voice session */
  createRealtimeSession(config: RealtimeSessionConfig): Promise<RealtimeSession>;

  /** Connect to an existing realtime session */
  connectToSession(
    sessionId: string,
    onEvent: RealtimeEventHandler,
  ): Promise<RealtimeConnection>;

  /** Generate structured feedback from a transcript */
  generateFeedback(params: FeedbackRequest): Promise<FeedbackResult>;
}

export interface RealtimeConnection {
  readonly sessionId: string;
  readonly status: RealtimeSession['status'];

  /** Send audio chunk to the session */
  sendAudio(chunk: ArrayBuffer): void;

  /** Send a text message to the session */
  sendText(text: string): void;

  /** Interrupt the current AI response (barge-in) */
  interrupt(): void;

  /** Gracefully close the connection */
  close(): void;

  /** Current latency estimate in ms */
  readonly latencyMs: number;

  /** Subscribe to connection events */
  onEvent(handler: RealtimeEventHandler): () => void;
}

// ---- Feedback Generation ----

export interface FeedbackRequest {
  transcript: Array<{ role: 'interviewer' | 'candidate'; content: string }>;
  interviewType: string;
  targetRole?: string;
  experienceLevel?: string;
}

export interface FeedbackResult {
  overallScore: number;
  communicationScore: number;
  confidenceScore: number;
  technicalReasoning: number | null;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  summary: string;
  tokenUsage?: { prompt: number; completion: number; total: number };
}
