/**
 * Provider Registry — selects and manages AI voice providers at runtime.
 * Configurable via VOICE_PROVIDER / VOICE_FALLBACK_PROVIDER env vars.
 * Never hardcode providers in application code.
 */

import { getEnv } from '@/config/env';
import { logger } from '@/monitoring/logger';
import type { AIProvider } from './provider';
import { openaiAdapter } from './openai-adapter';
import { elevenlabsAdapter } from './elevenlabs-conversational';

const aiLogger = logger.child({ component: 'ai-registry' });

export type ProviderName = 'elevenlabs' | 'openai' | 'mock';

const providers: Record<ProviderName, AIProvider> = {
  openai: openaiAdapter,
  elevenlabs: elevenlabsAdapter,
  mock: createMockProvider(),
};

let activeProviderName: ProviderName | null = null;

export function getActiveProvider(): { provider: AIProvider; name: ProviderName } {
  if (activeProviderName) {
    return { provider: providers[activeProviderName], name: activeProviderName };
  }

  const preferred = (process.env.VOICE_PROVIDER ?? 'elevenlabs') as ProviderName;
  const fallback = (process.env.VOICE_FALLBACK_PROVIDER ?? 'openai') as ProviderName;

  // Try preferred provider
  if (providers[preferred]) {
    activeProviderName = preferred;
    aiLogger.info({ msg: 'Voice provider selected', provider: preferred });
    return { provider: providers[preferred], name: preferred };
  }

  // Fallback
  if (providers[fallback]) {
    activeProviderName = fallback;
    aiLogger.warn({ msg: 'Preferred provider unavailable, using fallback', fallback });
    return { provider: providers[fallback], name: fallback };
  }

  // Ultimate fallback: mock
  activeProviderName = 'mock';
  aiLogger.warn({ msg: 'All providers unavailable, using mock' });
  return { provider: providers['mock'], name: 'mock' };
}

export function getProvider(name: ProviderName): AIProvider | null {
  return providers[name] ?? null;
}

/**
 * Mock provider for development — simulates a conversation.
 */
function createMockProvider(): AIProvider {
  return {
    name: 'mock',
    async createRealtimeSession() {
      return { id: 'mock-session', status: 'connected', model: 'mock', expiresAt: new Date(Date.now() + 3600000) };
    },
    async connectToSession(sessionId, onEvent) {
      return {
        sessionId,
        status: 'connected',
        latencyMs: 0,
        sendAudio() {},
        sendText() {},
        interrupt() {},
        close() {},
        onEvent() { return () => {}; },
      };
    },
    async generateFeedback() {
      return {
        overallScore: 75,
        communicationScore: 78,
        confidenceScore: 72,
        technicalReasoning: 74,
        strengths: ['Clear responses', 'Good examples'],
        weaknesses: ['Could go deeper on technical trade-offs'],
        improvements: ['Practice STAR responses', 'Elaborate on decisions'],
        summary: 'Solid performance with room for growth in technical depth.',
      };
    },
  };
}
