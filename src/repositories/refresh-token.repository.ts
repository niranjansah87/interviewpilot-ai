/**
 * Refresh token repository.
 */

import { prisma } from '@/database/client';
import { addDuration, Duration } from '@/lib/time';

export const refreshTokenRepository = {
  async create(userId: string, tokenHash: string, ttlSeconds: number) {
    const expiresAt = addDuration(new Date(), Duration.seconds(ttlSeconds));
    return prisma.refreshToken.create({
      data: { userId, tokenHash, expiresAt },
    });
  },

  async findByHash(tokenHash: string) {
    return prisma.refreshToken.findFirst({
      where: { tokenHash, revoked: false, expiresAt: { gt: new Date() } },
    });
  },

  async revoke(id: string) {
    return prisma.refreshToken.update({ where: { id }, data: { revoked: true } });
  },

  async revokeAllForUser(userId: string) {
    return prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    });
  },
};
