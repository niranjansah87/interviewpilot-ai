/**
 * OpenAI adapter — implements the AIProvider interface using the OpenAI SDK.
 * All OpenAI-specific logic lives here. Swapping providers = new adapter file.
 */

import OpenAI from 'openai';
import { getEnv } from '@/config/env';
import { logger } from '@/monitoring/logger';
import type {
  AIProvider,
  RealtimeSessionConfig,
  RealtimeSession,
  RealtimeConnection,
  RealtimeEvent,
  RealtimeEventHandler,
  FeedbackRequest,
  FeedbackResult,
} from './provider';
import { AIProviderError } from '@/lib/errors';

const aiLogger = logger.child({ provider: 'openai' });

let openaiClient: OpenAI | null = null;

function getClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: getEnv().OPENAI_API_KEY });
  }
  return openaiClient;
}

export const openaiAdapter: AIProvider = {
  name: 'openai',

  async createRealtimeSession(config: RealtimeSessionConfig): Promise<RealtimeSession> {
    try {
      const client = getClient();
      const response = await client.beta.realtime.sessions.create({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        model: config.model as any,
        instructions: config.instructions,
        voice: config.voice ?? 'alloy',
        temperature: config.temperature ?? 0.8,
        max_response_output_tokens: config.maxResponseOutputTokens ?? 4096,
        input_audio_transcription: config.inputAudioTranscription ?? {
          model: 'whisper-1',
        },
        turn_detection: config.turnDetection ?? {
          type: 'server_vad',
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 500,
        },
      });

      const sessionId = (response as unknown as Record<string, unknown>).id as string;
      const model = (response as unknown as Record<string, unknown>).model as string;
      const expiresAt = (response as unknown as Record<string, unknown>).expires_at as number;

      aiLogger.info({ msg: 'Realtime session created', sessionId });

      return {
        id: sessionId,
        status: 'connected',
        model,
        expiresAt: new Date(expiresAt * 1000),
      };
    } catch (error) {
      aiLogger.error({ msg: 'Failed to create realtime session', error: String(error) });
      throw new AIProviderError(
        error instanceof Error ? error.message : 'Failed to create session',
        'openai',
        true,
      );
    }
  },

  async connectToSession(
    sessionId: string,
    onEvent: RealtimeEventHandler,
  ): Promise<RealtimeConnection> {
    const adapter = new OpenAIConnection(sessionId, onEvent);
    await adapter.initialize();
    return adapter;
  },

  async generateFeedback(params: FeedbackRequest): Promise<FeedbackResult> {
    try {
      const client = getClient();
      const transcriptText = params.transcript
        .map((e) => `${e.role}: ${e.content}`)
        .join('\n\n');

      const completion = await client.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'system',
            content: buildFeedbackSystemPrompt(params),
          },
          {
            role: 'user',
            content: `Analyze this interview transcript and provide structured feedback:\n\n${transcriptText}`,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      });

      const result = JSON.parse(
        completion.choices[0]?.message?.content ?? '{}',
      ) as FeedbackResult;

      return {
        ...result,
        tokenUsage: {
          prompt: completion.usage?.prompt_tokens ?? 0,
          completion: completion.usage?.completion_tokens ?? 0,
          total: completion.usage?.total_tokens ?? 0,
        },
      };
    } catch (error) {
      aiLogger.error({ msg: 'Feedback generation failed', error: String(error) });
      throw new AIProviderError(
        error instanceof Error ? error.message : 'Feedback generation failed',
        'openai',
        true,
      );
    }
  },
};

// ---- WebRTC Connection Adapter ----

class OpenAIConnection implements RealtimeConnection {
  readonly sessionId: string;
  public status: RealtimeSession['status'] = 'connecting';
  public latencyMs = 0;

  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private handlers: RealtimeEventHandler[] = [];

  constructor(sessionId: string, onEvent: RealtimeEventHandler) {
    this.sessionId = sessionId;
    this.handlers.push(onEvent);
  }

  async initialize(): Promise<void> {
    this.peerConnection = new RTCPeerConnection();

    this.peerConnection.ontrack = (event) => {
      const [stream] = event.streams;
      if (stream && typeof window !== 'undefined') {
        this.audioElement = new Audio();
        this.audioElement.srcObject = stream;
        this.audioElement.autoplay = true;
      }
    };

    this.dataChannel = this.peerConnection.createDataChannel('oai-events');

    this.dataChannel.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.dispatch(data as RealtimeEvent);
      } catch {
        this.dispatch({ type: 'response.audio.delta', audio: event.data });
      }
    };

    this.status = 'connected';
  }

  private dispatch(event: RealtimeEvent): void {
    for (const handler of this.handlers) {
      handler(event);
    }
  }

  sendAudio(chunk: ArrayBuffer): void {
    if (this.dataChannel?.readyState === 'open') {
      this.dataChannel.send(chunk);
    }
  }

  sendText(text: string): void {
    if (this.dataChannel?.readyState === 'open') {
      this.dataChannel.send(
        JSON.stringify({
          type: 'conversation.item.create',
          item: {
            type: 'message',
            role: 'user',
            content: [{ type: 'input_text', text }],
          },
        }),
      );
      this.dataChannel.send(JSON.stringify({ type: 'response.create' }));
    }
  }

  interrupt(): void {
    if (this.dataChannel?.readyState === 'open') {
      this.dataChannel.send(JSON.stringify({ type: 'response.cancel' }));
    }
  }

  close(): void {
    this.status = 'disconnecting';
    this.audioElement?.pause();
    this.dataChannel?.close();
    this.peerConnection?.close();
    this.status = 'disconnected';
    this.dispatch({ type: 'session.updated' });
  }

  onEvent(handler: RealtimeEventHandler): () => void {
    this.handlers.push(handler);
    return () => {
      this.handlers = this.handlers.filter((h) => h !== handler);
    };
  }
}

// ---- Helper ----

function buildFeedbackSystemPrompt(params: FeedbackRequest): string {
  return `You are an expert interview coach analyzing a ${params.interviewType} interview for a ${params.targetRole ?? 'software engineer'} position at ${params.experienceLevel ?? 'mid'} level.

Evaluate the candidate across these dimensions:
- Communication: clarity, structure, confidence
- Content depth: relevance, specificity, examples
- Technical reasoning: problem-solving, trade-off awareness

Return a JSON object with:
{
  "overallScore": 0-100,
  "communicationScore": 0-100,
  "confidenceScore": 0-100,
  "technicalReasoning": 0-100 or null,
  "strengths": ["specific strength 1", "..."],
  "weaknesses": ["specific weakness 1", "..."],
  "improvements": ["actionable improvement 1", "..."],
  "summary": "2-3 sentence summary"
}

Be specific. Cite examples from the transcript. Be constructive, not harsh.`;
}
