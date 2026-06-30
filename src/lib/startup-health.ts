/**
 * Startup infrastructure health check.
 * Runs once on server boot — verifies Database, Redis, OpenAI, ElevenLabs.
 * Logs each service with status and latency.
 */

import { logger } from '@/monitoring/logger';

interface CheckResult {
  service: string;
  status: 'up' | 'down' | 'degraded';
  latencyMs: number;
}

async function checkDatabase(url: string | undefined): Promise<CheckResult> {
  const start = Date.now();
  if (!url) {
    return { service: 'PostgreSQL', status: 'down', latencyMs: 0 };
  }
  try {
    const { PrismaClient } = await import('@prisma/client');
    const client = new PrismaClient({ datasourceUrl: url });
    await client.$queryRawUnsafe('SELECT 1');
    await client.$disconnect();
    return { service: 'PostgreSQL', status: 'up', latencyMs: Date.now() - start };
  } catch {
    return { service: 'PostgreSQL', status: 'down', latencyMs: Date.now() - start };
  }
}

async function checkRedis(url: string | undefined): Promise<CheckResult> {
  const start = Date.now();
  if (!url) {
    return { service: 'Redis', status: 'degraded', latencyMs: 0 };
  }
  try {
    const { default: Redis } = await import('ioredis');
    const r = new Redis(url, { lazyConnect: true, connectTimeout: 5000, maxRetriesPerRequest: 1 });
    await r.connect();
    await r.ping();
    await r.quit();
    return { service: 'Redis', status: 'up', latencyMs: Date.now() - start };
  } catch {
    return { service: 'Redis', status: 'down', latencyMs: Date.now() - start };
  }
}

async function checkOpenAI(key: string | undefined): Promise<CheckResult> {
  const start = Date.now();
  if (!key) {
    return { service: 'OpenAI', status: 'down', latencyMs: 0 };
  }
  try {
    const resp = await fetch('https://api.openai.com/v1/models', {
      headers: { Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(8000),
    });
    if (resp.ok) {
      return { service: 'OpenAI', status: 'up', latencyMs: Date.now() - start };
    }
    return { service: 'OpenAI', status: 'down', latencyMs: Date.now() - start };
  } catch {
    return { service: 'OpenAI', status: 'down', latencyMs: Date.now() - start };
  }
}

async function checkElevenLabs(key: string | undefined): Promise<CheckResult> {
  const start = Date.now();
  if (!key) {
    return { service: 'ElevenLabs', status: 'degraded', latencyMs: 0 };
  }
  try {
    // Use /v1/voices — the same endpoint used for voice synthesis.
    // /v1/user requires admin scopes most API keys don't have.
    const resp = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: { 'xi-api-key': key },
      signal: AbortSignal.timeout(8000),
    });
    if (resp.ok) {
      return { service: 'ElevenLabs', status: 'up', latencyMs: Date.now() - start };
    }
    return { service: 'ElevenLabs', status: 'down', latencyMs: Date.now() - start };
  } catch {
    return { service: 'ElevenLabs', status: 'down', latencyMs: Date.now() - start };
  }
}

export async function runStartupHealthCheck() {
  const [db, redis, openai, elev] = await Promise.all([
    checkDatabase(process.env.DATABASE_URL),
    checkRedis(process.env.REDIS_URL),
    checkOpenAI(process.env.OPENAI_API_KEY),
    checkElevenLabs(process.env.ELEVENLABS_API_KEY),
  ]);

  const results = [db, redis, openai, elev];

  for (const r of results) {
    logger.info({
      service: r.service,
      status: r.status,
      latencyMs: r.latencyMs,
    });
  }

  const down = results.filter((r) => r.status === 'down').length;
  const degraded = results.filter((r) => r.status === 'degraded').length;
  const up = results.length - down - degraded;

  logger.info({
    msg: `Infrastructure health: ${up} up, ${down} down, ${degraded} degraded`,
    servicesChecked: results.length,
  });
}
