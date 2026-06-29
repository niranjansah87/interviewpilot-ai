#!/usr/bin/env tsx
/**
 * bootstrap.ts
 *
 * Initial project setup. Run this after cloning the repository.
 *
 * 1. Verifies environment variables
 * 2. Generates Prisma client
 * 3. Runs database migrations
 * 4. Seeds development data (optional)
 *
 * Usage: tsx scripts/bootstrap.ts [--with-seed]
 */

import { execFileSync } from 'node:child_process';
import { resolve } from 'path';

const root = resolve(process.cwd());

function run(command: string, args: string[], label: string): void {
  console.log(`\n${label}...`);
  try {
    execFileSync(command, args, { cwd: root, stdio: 'inherit' });
    console.log(`✅ ${label}`);
  } catch {
    console.error(`❌ ${label} failed`);
    process.exit(1);
  }
}

async function main(): Promise<void> {
  console.log('🚀 InterviewPilot AI — Bootstrap\n');

  // Verify env
  run('tsx', ['scripts/verify-env.ts'], 'Verifying environment variables');

  // Generate Prisma client
  run('npx', ['prisma', 'generate'], 'Generating Prisma client');

  // Run migrations
  run('npx', ['prisma', 'migrate', 'dev', '--name', 'init'], 'Running initial migration');

  // Seed (optional)
  if (process.argv.includes('--with-seed')) {
    run('npx', ['prisma', 'db', 'seed'], 'Seeding database');
  }

  console.log('\n✅ Bootstrap complete');
}

main().catch((err) => {
  console.error('Bootstrap failed:', err);
  process.exit(1);
});
