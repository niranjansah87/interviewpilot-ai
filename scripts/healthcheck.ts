#!/usr/bin/env tsx
/**
 * healthcheck.ts
 *
 * Verifies that critical services are reachable:
 * - PostgreSQL (via Prisma)
 * - OpenAI API
 *
 * Usage: tsx scripts/healthcheck.ts
 */

import { prisma } from '../src/database/client';

async function checkDatabase(): Promise<void> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ PostgreSQL connection OK');
  } catch (err) {
    console.error('❌ PostgreSQL connection failed:', err);
    throw err;
  }
}

async function checkOpenAI(): Promise<void> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn('⚠️  OPENAI_API_KEY not set — skipping OpenAI check');
    return;
  }

  try {
    const res = await fetch('https://api.openai.com/v1/models', {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (res.ok) {
      console.log('✅ OpenAI API OK');
    } else {
      console.error(`❌ OpenAI API returned ${res.status}`);
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ OpenAI API unreachable:', err);
    process.exit(1);
  }
}

async function main(): Promise<void> {
  console.log('Running health checks...\n');
  await checkDatabase();
  await checkOpenAI();
  console.log('\n✅ All health checks passed');
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error('Health check failed:', err);
  await prisma.$disconnect().catch(() => {});
  process.exit(1);
});
