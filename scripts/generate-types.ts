#!/usr/bin/env tsx
/**
 * generate-types.ts
 *
 * Generates TypeScript types from Prisma schema.
 * Wrapper around `prisma generate`.
 *
 * Usage: tsx scripts/generate-types.ts
 */

import { execFileSync } from 'node:child_process';
import { resolve } from 'path';

async function main(): Promise<void> {
  const root = resolve(process.cwd());
  console.log('Generating Prisma client...');

  try {
    execFileSync('npx', ['prisma', 'generate'], {
      cwd: root,
      stdio: 'inherit',
    });
    console.log('✅ Prisma client generated');
  } catch {
    console.error('❌ Prisma generate failed');
    process.exit(1);
  }
}

main();
