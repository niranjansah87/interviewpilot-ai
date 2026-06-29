/**
 * Cache key factory — all cache keys defined in one place.
 * Prevents key collisions and makes invalidation predictable.
 *
 * Key format: {entity}:{id}:{subresource}:{variant}
 */

const CACHE_PREFIX = 'ip'; // InterviewPilot abbreviation

function buildKey(parts: string[]): string {
  return [CACHE_PREFIX, ...parts].join(':');
}

// ---------------------------------------------------------------------------
// User
// ---------------------------------------------------------------------------

export const cacheKeys = {
  user: (id: string) => buildKey(['user', id]),
  userSessions: (userId: string) => buildKey(['user', userId, 'sessions']),

  // ---------------------------------------------------------------------------
  // Interview
  // ---------------------------------------------------------------------------
  interview: (id: string) => buildKey(['interview', id]),
  interviewList: (userId: string) => buildKey(['interview', 'list', userId]),
  interviewConfig: (type: string, level: string) =>
    buildKey(['interview', 'config', type, level]),

  // ---------------------------------------------------------------------------
  // Transcript
  // ---------------------------------------------------------------------------
  transcript: (sessionId: string) => buildKey(['transcript', sessionId]),

  // ---------------------------------------------------------------------------
  // Feedback
  // ---------------------------------------------------------------------------
  feedback: (sessionId: string) => buildKey(['feedback', sessionId]),

  // ---------------------------------------------------------------------------
  // AI / Prompts
  // ---------------------------------------------------------------------------
  prompt: (type: string, version: string) =>
    buildKey(['prompt', type, version]),
  llmResponse: (hash: string) => buildKey(['llm', 'response', hash]),

  // ---------------------------------------------------------------------------
  // Rate Limiting
  // ---------------------------------------------------------------------------
  rateLimit: (ip: string, endpoint: string) =>
    buildKey(['ratelimit', endpoint, ip]),

  // ---------------------------------------------------------------------------
  // Config
  // ---------------------------------------------------------------------------
  appConfig: () => buildKey(['config', 'app']),

  // ---------------------------------------------------------------------------
  // Analytics
  // ---------------------------------------------------------------------------
  analyticsDaily: (date: string) => buildKey(['analytics', 'daily', date]),
  analyticsUser: (userId: string, window: string) =>
    buildKey(['analytics', 'user', userId, window]),
} as const;
