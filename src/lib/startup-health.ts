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
  detail?: string;
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

async function checkElevenLabsAgent(id: string | undefined, key: string | undefined, label: string): Promise<CheckResult> {
  const start = Date.now();
  if (!id || !key) {
    return { service: `ElevenLabs ${label}`, status: 'degraded', latencyMs: 0, detail: 'not configured' };
  }
  try {
    // Check actual credits/characters remaining via subscription API
    const subResp = await fetch('https://api.elevenlabs.io/v1/user/subscription', {
      headers: { 'xi-api-key': key },
      signal: AbortSignal.timeout(8000),
    });

    if (!subResp.ok) {
      return { service: `ElevenLabs ${label}`, status: 'down', latencyMs: Date.now() - start };
    }

    const data = await subResp.json() as { character_count?: number; character_limit?: number; subscription?: { character_count?: number; character_limit?: number } };
    // Fields may be at top level OR nested under .subscription
    const used = data?.character_count ?? data?.subscription?.character_count ?? 0;
    const limit = data?.character_limit ?? data?.subscription?.character_limit ?? 1;
    const remaining = limit - used;

    // Also verify agent exists
    const params = new URLSearchParams({ agent_id: id });
    const agentResp = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?${params}`,
      { headers: { 'xi-api-key': key }, signal: AbortSignal.timeout(8000) },
    );

    const creditInfo = `${remaining.toLocaleString()} remaining · ${used.toLocaleString()} used of ${limit.toLocaleString()} total`;
    if (remaining < 150 || !agentResp.ok) {
      const body = await agentResp.json().catch(() => ({})) as { detail?: { message?: string } };
      const msg = body?.detail?.message ?? '';
      const reason = remaining < 150 ? `low credits — ${creditInfo}` : msg;
      return { service: `ElevenLabs ${label}`, status: 'degraded', latencyMs: Date.now() - start, detail: creditInfo };
    }

    return {
      service: `ElevenLabs ${label}`,
      status: 'up',
      latencyMs: Date.now() - start,
      detail: creditInfo,
    };
  } catch {
    return { service: `ElevenLabs ${label}`, status: 'down', latencyMs: Date.now() - start };
  }
}

export async function runStartupHealthCheck() {
  const [db, redis, openai, el1, el2, el3] = await Promise.all([
    checkDatabase(process.env.DATABASE_URL),
    checkRedis(process.env.REDIS_URL),
    checkOpenAI(process.env.OPENAI_API_KEY),
    checkElevenLabsAgent(process.env.ELEVENLABS_AGENT_ID, process.env.ELEVENLABS_API_KEY, 'agent-1'),
    checkElevenLabsAgent(process.env.ELEVENLABS_BACKUP_AGENT_ID, process.env.ELEVENLABS_BACKUP_API_KEY, 'agent-2'),
    checkElevenLabsAgent(process.env.ELEVENLABS_EXTRA_AGENT_ID, process.env.ELEVENLABS_EXTRA_API_KEY, 'agent-3'),
  ]);

  const results = [db, redis, openai, el1, el2, el3];

  for (const r of results) {
    logger.info({
      service: r.service,
      status: r.status,
      latencyMs: r.latencyMs,
      ...(r.detail ? { detail: r.detail } : {}),
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
