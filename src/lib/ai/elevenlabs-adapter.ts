/**
 * ElevenLabs TTS adapter — text-to-speech for the AI interviewer.
 * Used as a voice provider when OpenAI Realtime is unavailable or as an alternative.
 */

import { getEnv } from '@/config/env';
import { logger } from '@/monitoring/logger';

const ttsLogger = logger.child({ provider: 'elevenlabs' });

const BASE_URL = 'https://api.elevenlabs.io/v1';

interface ElevenLabsConfig {
  apiKey: string;
  voiceId?: string;
  modelId?: string;
}

// Production-quality voice IDs for interviewing
const VOICE_IDS = {
  // Professional, warm, clear — good for behavioral interviews
  professional_female: '21m00Tcm4TlvDq8ikWAM', // Rachel
  professional_male: 'CwhRBWXzGAHq8TQ4Fs17',   // Roger
  // Calm, authoritative — good for technical interviews
  authoritative_male: 'onwK4e9ZLuTAKqWW03F9',   // Daniel
  // Friendly, encouraging
  friendly_female: 'EXAVITQu4vr4xnSDxMaL',       // Bella
};

/**
 * ElevenLabs TTS adapter.
 */
export const elevenlabsAdapter = {
  /** List available voices */
  async listVoices() {
    const res = await fetch(`${BASE_URL}/voices`, {
      headers: { 'xi-api-key': getEnv().ELEVENLABS_API_KEY ?? '' },
    });
    if (!res.ok) throw new Error(`ElevenLabs error: ${res.status}`);
    return res.json();
  },

  /** Convert text to speech audio */
  async textToSpeech(
    text: string,
    options?: { voiceId?: string; modelId?: string },
  ): Promise<ArrayBuffer> {
    const voiceId = options?.voiceId ?? VOICE_IDS.professional_male;
    const modelId = options?.modelId ?? 'eleven_flash_v2_5';

    const res = await fetch(
      `${BASE_URL}/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': getEnv().ELEVENLABS_API_KEY ?? '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: modelId,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.3,
          },
        }),
      },
    );

    if (!res.ok) {
      const err = await res.text();
      ttsLogger.error({ msg: 'ElevenLabs TTS failed', error: err });
      throw new Error(`TTS failed: ${res.status}`);
    }

    return res.arrayBuffer();
  },

  /** Stream text-to-speech for lower latency */
  async streamTTS(
    text: string,
    onChunk: (chunk: ArrayBuffer) => void,
    options?: { voiceId?: string; modelId?: string },
  ): Promise<void> {
    const voiceId = options?.voiceId ?? VOICE_IDS.professional_male;
    const modelId = options?.modelId ?? 'eleven_flash_v2_5';

    const res = await fetch(
      `${BASE_URL}/text-to-speech/${voiceId}/stream?output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': getEnv().ELEVENLABS_API_KEY ?? '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: modelId,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      },
    );

    if (!res.ok || !res.body) {
      throw new Error(`TTS stream failed: ${res.status}`);
    }

    const reader = res.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) onChunk(value.buffer);
    }
  },
};

export default elevenlabsAdapter;
