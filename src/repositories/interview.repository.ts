/**
 * Interview session repository.
 */

import { prisma } from '@/database/client';
import type { InterviewStatus, InterviewType, ExperienceLevel } from '@prisma/client';
import type { PaginatedResult } from '@/types/common';

export const interviewRepository = {
  async create(data: {
    userId: string;
    type: InterviewType;
    targetRole?: string;
    experienceLevel?: ExperienceLevel;
  }) {
    return prisma.interviewSession.create({ data });
  },

  async findById(id: string) {
    return prisma.interviewSession.findUnique({ where: { id } });
  },

  async findByUser(
    userId: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResult<unknown>> {
    const [data, total] = await Promise.all([
      prisma.interviewSession.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.interviewSession.count({ where: { userId } }),
    ]);
    return {
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async updateStatus(id: string, status: InterviewStatus, extra?: Record<string, unknown>) {
    return prisma.interviewSession.update({
      where: { id },
      data: { status, ...extra },
    });
  },

  async delete(id: string) {
    return prisma.interviewSession.delete({ where: { id } });
  },
};
