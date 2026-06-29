#!/usr/bin/env tsx
/**
 * verify-env.ts
 *
 * Validates that all required environment variables are present and
 * conform to their Zod schemas before the application starts.
 *
 * Usage: tsx scripts/verify-env.ts
 */

import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  OPENAI_API_KEY: z.string().startsWith('sk-'),
  OPENAI_REALTIME_MODEL: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

type Env = z.infer<typeof envSchema>;

function validate(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.errors
      .map((e) => `  - ${e.path.join('.')}: ${e.message}`)
      .join('\n');

    console.error('❌ Environment validation failed:\n' + errors);
    process.exit(1);
  }

  console.log('✅ Environment variables validated');
  return result.data;
}

validate();
