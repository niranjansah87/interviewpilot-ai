/**
 * User repository — data access for users.
 */

import { prisma } from '@/database/client';
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

export const userRepository = {
  async findById(id: string): Promise<UserRecord | null> {
    return prisma.user.findUnique({ where: { id }, select: userSelect });
  },

  async findByEmail(email: string): Promise<UserRecord | null> {
    return prisma.user.findUnique({ where: { email }, select: userSelect });
  },

  async create(data: { email: string; passwordHash: string; name?: string }): Promise<UserRecord> {
    return prisma.user.create({ data, select: userSelect });
  },

  async update(id: string, data: { name?: string; email?: string; passwordHash?: string }): Promise<UserRecord> {
    return prisma.user.update({ where: { id }, data, select: userSelect });
  },

  async delete(id: string): Promise<void> {
    await prisma.user.delete({ where: { id } });
  },
};
