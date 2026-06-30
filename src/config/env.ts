/**
 * Centralized environment variable validation using Zod v4.
 * Server-side: validates all vars. Client-side: only validates NEXT_PUBLIC_* vars.
 * No module may access process.env directly outside this file.
 */

import { z } from 'zod';

// ---- Shared (both client and server) ----

const sharedSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
});

// ---- Server-only ----

const serverSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url(),
  API_VERSION: z.string().default('v1'),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),
  OPENAI_API_KEY: z.string().min(1),
  OPENAI_REALTIME_MODEL: z.string().min(1),
  ELEVENLABS_API_KEY: z.string().optional(),
  ELEVENLABS_AGENT_ID: z.string().optional(),
  VOICE_PROVIDER: z.enum(['elevenlabs', 'openai', 'mock']).default('elevenlabs'),
  VOICE_FALLBACK_PROVIDER: z.enum(['elevenlabs', 'openai', 'mock']).default('mock'),
  CACHE_PROVIDER: z.enum(['memory', 'redis']).default('memory'),
  REDIS_URL: z.string().url().optional(),
  SENTRY_DSN: z.string().url().optional(),
  SENTRY_ENVIRONMENT: z.string().optional(),
  RATE_LIMIT_WINDOW_SECONDS: z.coerce.number().default(60),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
});

const fullSchema = sharedSchema.merge(serverSchema);

// ---- Types ----

type ServerEnv = z.infer<typeof fullSchema>;
type ClientEnv = z.infer<typeof sharedSchema>;

let envCache: ServerEnv | null = null;

// ---- Runtime detection ----

const isServer = typeof window === 'undefined';

// ---- Client-safe reader ----

function readEnv(key: string): string | undefined {
  // Next.js replaces NEXT_PUBLIC_* at build time — use process.env directly
  return process.env[key];
}

// ---- Getter ----

export function getEnv(): ServerEnv {
  if (envCache) return envCache;

  // Client-side: only validate shared vars, return defaults for server vars
  if (!isServer) {
    // On the client, server vars don't exist — return safe defaults
    // The actual values are used server-side only (API routes, SSR)
    const clientSafe: ServerEnv = {
      NODE_ENV: (process.env.NODE_ENV ?? 'development') as ServerEnv['NODE_ENV'],
      LOG_LEVEL: (process.env.LOG_LEVEL ?? 'info') as ServerEnv['LOG_LEVEL'],
      NEXT_PUBLIC_APP_URL: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
      API_VERSION: 'v1',
      DATABASE_URL: '',
      JWT_SECRET: '',
      JWT_REFRESH_SECRET: '',
      JWT_ACCESS_EXPIRY: '15m',
      JWT_REFRESH_EXPIRY: '7d',
      OPENAI_API_KEY: '',
      OPENAI_REALTIME_MODEL: '',
      ELEVENLABS_API_KEY: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY ?? '',
      ELEVENLABS_AGENT_ID: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID ?? '',
      VOICE_PROVIDER: (process.env.NEXT_PUBLIC_VOICE_PROVIDER ?? 'elevenlabs') as ServerEnv['VOICE_PROVIDER'],
      VOICE_FALLBACK_PROVIDER: (process.env.NEXT_PUBLIC_VOICE_FALLBACK_PROVIDER ?? 'mock') as ServerEnv['VOICE_FALLBACK_PROVIDER'],
      CACHE_PROVIDER: 'memory',
      REDIS_URL: undefined,
      SENTRY_DSN: undefined,
      SENTRY_ENVIRONMENT: undefined,
      RATE_LIMIT_WINDOW_SECONDS: 60,
      RATE_LIMIT_MAX_REQUESTS: 100,
    };
    envCache = clientSafe;
    return clientSafe;
  }

  // Server-side: validate everything
  const result = fullSchema.safeParse(process.env);

  if (!result.success) {
    const messages = result.error.issues
      .map((e) => `  - ${e.path.join('.')}: ${e.message}`)
      .join('\n');

    const error = new Error(`Environment validation failed:\n${messages}`);
    (error as NodeJS.ErrnoException).code = 'INVALID_ENV';
    throw error;
  }

  envCache = result.data;
  return envCache;
}

export function getEnvWithRequest(): ServerEnv {
  // For server-side requests — always validate fresh
  if (!isServer) return getEnv();

  const result = fullSchema.safeParse(process.env);
  if (!result.success) throw result.error;
  return result.data;
}

export function getenv(key: keyof ServerEnv): string | undefined {
  return getEnv()[key] as string | undefined;
}
