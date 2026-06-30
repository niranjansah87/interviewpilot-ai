/**
 * Interview service — business logic for interview session management.
 */

import { interviewRepository } from '@/repositories/interview.repository';
import { NotFoundError, AuthorizationError } from '@/lib/errors';
import { logger } from '@/monitoring/logger';

const interviewLogger = logger.child({ service: 'interview' });

export const interviewService = {
  async create(data: {
    userId: string;
    type: 'BEHAVIORAL' | 'TECHNICAL' | 'MIXED';
    targetRole?: string;
    experienceLevel?: 'JUNIOR' | 'MID' | 'SENIOR';
    status?: string;
    scheduledAt?: string;
  }) {
    const session = await interviewRepository.create(data);
    interviewLogger.info({ msg: 'Interview session created',
      sessionId: session.id,
      userId: data.userId,
      type: data.type,
    });
    return session;
  },

  async getById(id: string, userId: string) {
    const session = await interviewRepository.findById(id);
    if (!session) throw new NotFoundError('Interview session', id);
    if (session.userId !== userId) {
      throw new AuthorizationError('You do not have access to this interview');
    }
    return session;
  },

  async list(userId: string, page = 1, limit = 10) {
    return interviewRepository.findByUser(userId, page, limit);
  },

  async delete(id: string, userId: string) {
    const session = await interviewRepository.findById(id);
    if (!session) throw new NotFoundError('Interview session', id);
    if (session.userId !== userId) {
      throw new AuthorizationError();
    }
    await interviewRepository.delete(id);
    interviewLogger.info({ msg: 'Interview session deleted', sessionId: id, userId });
    return { deleted: true };
  },
};
