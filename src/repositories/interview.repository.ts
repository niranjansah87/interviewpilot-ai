/**
 * Interview session repository with Redis cache-aside.
 */

import { prisma } from '@/database/client';
import { cache } from '@/cache/cache-manager';
import { cacheKeys } from '@/cache/cache-keys';
import type { InterviewStatus, InterviewType, ExperienceLevel } from '@prisma/client';
import type { PaginatedResult } from '@/types/common';

const INTERVIEW_TTL = 3600; // 1 hour
const LIST_TTL = 300; // 5 minutes

export const interviewRepository = {
  async create(data: {
    userId: string;
    type: InterviewType;
    targetRole?: string;
    experienceLevel?: ExperienceLevel;
  }) {
    const session = await prisma.interviewSession.create({ data });
    // Invalidate user's interview list cache
    await cache.delete(cacheKeys.interviewList(data.userId));
    return session;
  },

  async findById(id: string) {
    return cache.getOrSet(
      cacheKeys.interview(id),
      () => prisma.interviewSession.findUnique({ where: { id }, include: { feedback: true } }),
      { ttlSeconds: INTERVIEW_TTL },
    );
  },

  async findByUser(
    userId: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResult<unknown>> {
    const listKey = cacheKeys.interviewList(userId) + `:p${page}:l${limit}`;
    return cache.getOrSet(
      listKey,
      async () => {
        const [data, total] = await Promise.all([
          prisma.interviewSession.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
            include: { feedback: true },
          }),
          prisma.interviewSession.count({ where: { userId } }),
        ]);
        return {
          data,
          pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
      },
      { ttlSeconds: LIST_TTL },
    );
  },

  async updateStatus(id: string, status: InterviewStatus, extra?: Record<string, unknown>) {
    const session = await prisma.interviewSession.update({
      where: { id },
      data: { status, ...extra },
    });
    // Invalidate caches
    await cache.delete(cacheKeys.interview(id));
    await cache.deletePattern(cacheKeys.interviewList('*'));
    return session;
  },

  async delete(id: string) {
    const session = await prisma.interviewSession.delete({ where: { id } });
    await cache.delete(cacheKeys.interview(id));
    await cache.deletePattern(cacheKeys.interviewList('*'));
    return session;
  },
};
