/**
 * Centralized environment variable validation using Zod v4.
 * All runtime config is validated at import time.
 * No module may access process.env directly outside this file.
 */

import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),

  // App
  NEXT_PUBLIC_APP_URL: z.string().url(),
  API_VERSION: z.string().default('v1'),

  // Database
  DATABASE_URL: z.string().url(),

  // Auth
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),

  // AI / OpenAI
  OPENAI_API_KEY: z.string().min(1),
  OPENAI_REALTIME_MODEL: z.string().min(1),

  // ElevenLabs voice AI
  ELEVENLABS_API_KEY: z.string().optional(),
  ELEVENLABS_AGENT_ID: z.string().optional(),

  // Voice provider selection
  VOICE_PROVIDER: z.enum(['elevenlabs', 'openai', 'mock']).default('elevenlabs'),
  VOICE_FALLBACK_PROVIDER: z.enum(['elevenlabs', 'openai', 'mock']).default('mock'),

  // Cache
  CACHE_PROVIDER: z.enum(['memory', 'redis']).default('memory'),
  REDIS_URL: z.string().url().optional(),

  // Observability
  LOG_LEVEL: z
    .enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal'])
    .default('info'),
  SENTRY_DSN: z.string().url().optional(),
  SENTRY_ENVIRONMENT: z.string().optional(),

  // Rate limiting
  RATE_LIMIT_WINDOW_SECONDS: z.coerce.number().default(60),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
});

type Env = z.infer<typeof envSchema>;

let envCache: Env | null = null;

/**
 * Validate and return all environment variables.
 * Caches the result after first call.
 * Throws if any required variable is missing or invalid.
 */
export function getEnv(): Env {
  if (envCache) return envCache;

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const messages = result.error.issues
      .map((e) => `  - ${e.path.join('.')}: ${e.message}`)
      .join('\n');

    const error = new Error(
      `Environment validation failed:\n${messages}`,
    );
    (error as NodeJS.ErrnoException).code = 'INVALID_ENV';
    throw error;
  }

  envCache = result.data;
  return envCache;
}

/**
 * Per-request environment access (for server-side use).
 * Ensures fresh env reads per request in serverless environments.
 */
export function getEnvWithRequest(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    throw result.error;
  }
  return result.data;
}

/**
 * Shortcut: get a specific env var.
 */
export function getenv(key: keyof Env): string | undefined {
  return getEnv()[key] as string | undefined;
}
