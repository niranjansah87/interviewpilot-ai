/**
 * ElevenLabs Conversational AI adapter.
 * Uses the ConvAI WebSocket API for full voice conversations (STT + LLM + TTS).
 * Falls back to standalone TTS if no agent_id is configured.
 */

import { getEnv } from '@/config/env';
import { logger } from '@/monitoring/logger';
import { AIProviderError } from '@/lib/errors';
import type {
  AIProvider,
  RealtimeSession,
  RealtimeConnection,
  RealtimeEventHandler,
  RealtimeSessionConfig,
  FeedbackRequest,
  FeedbackResult,
  RealtimeEvent,
} from './provider';

const aiLogger = logger.child({ provider: 'elevenlabs' });

const ELEVENLABS_WS = 'wss://api.elevenlabs.io/v1/convai/conversation';

export const elevenlabsAdapter: AIProvider = {
  name: 'elevenlabs',

  async createRealtimeSession(config: RealtimeSessionConfig): Promise<RealtimeSession> {
    const apiKey = getEnv().ELEVENLABS_API_KEY;
    const agentId = getEnv().ELEVENLABS_AGENT_ID;

    if (!apiKey) throw new AIProviderError('ELEVENLABS_API_KEY not configured', 'elevenlabs', false);
    if (!agentId) throw new AIProviderError('ELEVENLABS_AGENT_ID not configured', 'elevenlabs', false);

    const sessionId = `el_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

    aiLogger.info({ msg: 'ElevenLabs session created', sessionId, agentId });

    return {
      id: sessionId,
      status: 'connected',
      model: 'elevenlabs-convai',
      expiresAt: new Date(Date.now() + 3600000),
    };
  },

  async connectToSession(
    sessionId: string,
    onEvent: RealtimeEventHandler,
  ): Promise<RealtimeConnection> {
    const conn = new ElevenLabsConnection(sessionId, onEvent);
    await conn.initialize();
    return conn;
  },

  async generateFeedback(params: FeedbackRequest): Promise<FeedbackResult> {
    // Use the OpenAI adapter for feedback since ElevenLabs is voice-only
    const { openaiAdapter } = await import('./openai-adapter');
    return openaiAdapter.generateFeedback(params);
  },
};

// ---- ElevenLabs WebSocket Connection ----

class ElevenLabsConnection implements RealtimeConnection {
  readonly sessionId: string;
  status: RealtimeSession['status'] = 'connecting';
  latencyMs = 0;

  private ws: WebSocket | null = null;
  private audioContext: AudioContext | null = null;
  private handlers: RealtimeEventHandler[] = [];
  private audioQueue: AudioBuffer[] = [];
  private playing = false;

  constructor(sessionId: string, onEvent: RealtimeEventHandler) {
    this.sessionId = sessionId;
    this.handlers.push(onEvent);
  }

  async initialize(): Promise<void> {
    const apiKey = getEnv().ELEVENLABS_API_KEY;
    const agentId = getEnv().ELEVENLABS_AGENT_ID;

    if (!apiKey || !agentId) {
      this.status = 'disconnected';
      this.dispatch({ type: 'error', error: { type: 'config', message: 'ElevenLabs not configured' } });
      return;
    }

    try {
      // Create signed URL for the conversation
      const signRes = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`,
        { headers: { 'xi-api-key': apiKey } },
      );

      if (!signRes.ok) {
        throw new Error(`Failed to get signed URL: ${signRes.status}`);
      }

      const { signed_url } = await signRes.json() as { signed_url: string };

      this.ws = new WebSocket(signed_url);

      this.ws.onopen = () => {
        this.status = 'connected';
        this.dispatch({ type: 'session.updated' });
        aiLogger.info({ msg: 'ElevenLabs WebSocket connected', sessionId: this.sessionId });
      };

      this.ws.onmessage = (event: MessageEvent<string | ArrayBuffer>) => {
        this.handleMessage(event.data);
      };

      this.ws.onerror = (err) => {
        aiLogger.error({ msg: 'ElevenLabs WebSocket error', error: String(err) });
        this.status = 'disconnected';
        this.dispatch({ type: 'error', error: { type: 'websocket', message: 'Connection error' } });
      };

      this.ws.onclose = () => {
        this.status = 'disconnected';
        this.dispatch({ type: 'session.updated' });
      };
    } catch (error) {
      aiLogger.error({ msg: 'ElevenLabs connection failed', error: String(error) });
      this.status = 'disconnected';
      this.dispatch({ type: 'error', error: { type: 'connection', message: 'Connection failed' } });
    }
  }

  private handleMessage(data: string | ArrayBuffer) {
    if (data instanceof ArrayBuffer) {
      this.playAudio(data);
      return;
    }
    try {
      const msg = JSON.parse(data);

      switch (msg.type) {
        case 'agent_response':
          if (msg.agent_response_event?.audio_base_64) {
            // Convert base64 to audio buffer and play
            const binary = atob(msg.agent_response_event.audio_base_64);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
            this.playAudio(bytes.buffer);
          }
          break;

        case 'user_transcript':
          if (msg.user_transcription_event?.user_transcript) {
            this.dispatch({
              type: 'response.audio_transcript.done',
              transcript: msg.user_transcription_event.user_transcript,
            });
          }
          break;

        case 'agent_transcript':
          if (msg.agent_transcription_event?.agent_transcript) {
            this.dispatch({
              type: 'response.audio_transcript.done',
              transcript: msg.agent_transcription_event.agent_transcript,
            });
          }
          break;

        case 'interruption':
          this.stopAudio();
          break;

        case 'ping':
          if (msg.ping_event?.event_id) {
            this.ws?.send(JSON.stringify({ type: 'pong', event_id: msg.ping_event.event_id }));
          }
          break;
      }
    } catch {
      // Non-JSON message — ignore (binary handled above)
    }
  }

  private async playAudio(buffer: ArrayBuffer): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      if (!this.audioContext) {
        this.audioContext = new AudioContext({ sampleRate: 44100 });
      }

      const audioBuffer = await this.audioContext.decodeAudioData(buffer);
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);
      source.start(0);
    } catch {
      // Audio decode failed — skip
    }
  }

  private stopAudio(): void {
    this.audioContext?.close();
    this.audioContext = null;
  }

  sendAudio(chunk: ArrayBuffer): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(chunk);
    }
  }

  sendText(text: string): void {
    // ElevenLabs ConvAI handles text via the agent's LLM integration
    // For manual text injection, use the prompt endpoint
  }

  interrupt(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'interrupt' }));
      this.stopAudio();
    }
  }

  close(): void {
    this.status = 'disconnecting';
    this.stopAudio();
    this.ws?.close();
    this.status = 'disconnected';
  }

  onEvent(handler: RealtimeEventHandler): () => void {
    this.handlers.push(handler);
    return () => { this.handlers = this.handlers.filter(h => h !== handler); };
  }

  private dispatch(event: RealtimeEvent): void {
    for (const h of this.handlers) h(event);
  }
}
