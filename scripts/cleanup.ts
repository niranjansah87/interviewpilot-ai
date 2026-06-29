#!/usr/bin/env tsx
/**
 * cleanup.ts
 *
 * Removes build artifacts, caches, and generated files.
 * Use this before committing or packaging.
 *
 * Usage: tsx scripts/cleanup.ts
 */

import { rm } from 'fs/promises';
import { join } from 'path';

const PATHS_TO_REMOVE = [
  '.next',
  'node_modules/.cache',
  '.turbo',
  '.parcel-cache',
  'coverage',
  '.nyc_output',
  'dist',
  'build',
  '*.tsbuildinfo',
  '.eslintcache',
  '.stylelintcache',
  'prisma/*.db',
  'prisma/*.db-journal',
];

async function cleanup(): Promise<void> {
  const root = process.cwd();

  for (const pattern of PATHS_TO_REMOVE) {
    const fullPath = join(root, pattern);
    try {
      await rm(fullPath, { recursive: true, force: true });
      console.log(`Removed: ${pattern}`);
    } catch {
      // Ignore errors — path may not exist
    }
  }

  console.log('\n✅ Cleanup complete');
}

cleanup();
