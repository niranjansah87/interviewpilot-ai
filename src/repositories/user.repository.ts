/**
 * User repository — data access for users with Redis cache-aside.
 */

import { prisma } from '@/database/client';
import { cache } from '@/cache/cache-manager';
import { cacheKeys } from '@/cache/cache-keys';
import type { Prisma } from '@prisma/client';

const userSelect = {
  id: true,
  email: true,
  passwordHash: true,
  name: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export type UserRecord = Prisma.UserGetPayload<{ select: typeof userSelect }>;

const USER_TTL = 900; // 15 minutes

export const userRepository = {
  async findById(id: string): Promise<UserRecord | null> {
    return cache.getOrSet(
      cacheKeys.user(id),
      () => prisma.user.findUnique({ where: { id }, select: userSelect }),
      { ttlSeconds: USER_TTL },
    );
  },

  async findByEmail(email: string): Promise<UserRecord | null> {
    // Don't cache by email — used for auth lookups, needs to be fresh
    return prisma.user.findUnique({ where: { email }, select: userSelect });
  },

  async create(data: { email: string; passwordHash: string; name?: string }): Promise<UserRecord> {
    const user = await prisma.user.create({ data, select: userSelect });
    await cache.set(cacheKeys.user(user.id), user, { ttlSeconds: USER_TTL });
    return user;
  },

  async update(id: string, data: { name?: string; email?: string; passwordHash?: string }): Promise<UserRecord> {
    const user = await prisma.user.update({ where: { id }, data, select: userSelect });
    await cache.set(cacheKeys.user(id), user, { ttlSeconds: USER_TTL });
    return user;
  },

  async delete(id: string): Promise<void> {
    await prisma.user.delete({ where: { id } });
    await cache.delete(cacheKeys.user(id));
  },
};
