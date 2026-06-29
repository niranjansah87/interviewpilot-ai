import { type NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api/route-helpers';
import { getSession } from '@/lib/api/get-session';
import { userRepository } from '@/repositories/user.repository';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { ValidationError, AuthenticationError } from '@/lib/errors';
import { logger } from '@/monitoring/logger';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const body = await req.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || typeof currentPassword !== 'string') {
      throw new ValidationError('Current password is required', 'currentPassword');
    }
    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
      throw new ValidationError('New password must be at least 8 characters', 'newPassword');
    }

    const user = await userRepository.findById(session.id);
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    const valid = await verifyPassword(currentPassword, user.passwordHash);
    if (!valid) {
      throw new AuthenticationError('Current password is incorrect');
    }

    const newHash = await hashPassword(newPassword);
    await userRepository.update(session.id, { passwordHash: newHash });

    logger.info({ msg: 'Password changed', userId: session.id });

    return apiSuccess({ message: 'Password updated successfully' });
  } catch (error) {
    return apiError(error);
  }
}
