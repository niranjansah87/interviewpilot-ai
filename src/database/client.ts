/**
 * Prisma client singleton.
 *
 * Uses the globalThis pattern to prevent multiple instances in development
 * (Next.js hot-reloads create multiple instances otherwise).
 *
 * Usage: import { prisma } from '@/database/client'
 */

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined,
};

function createPrismaClient(): PrismaClient {
  const logLevels: Array<'query' | 'info' | 'warn' | 'error'> =
    process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'];

  return new PrismaClient({
    log: logLevels,
  });
}

/** The singleton Prisma client instance. */
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

/** Freeze the client in production to prevent modifications. */
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;

/**
 * Disconnect and reconnect — useful for serverless environments.
 * Call prisma.$disconnect() in production to prevent connection pool exhaustion.
 */
export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
}

export async function connectPrisma(): Promise<void> {
  await prisma.$connect();
}
