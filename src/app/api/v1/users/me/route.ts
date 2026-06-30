import { type NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api/route-helpers';
import { getSession } from '@/lib/api/get-session';
import { userRepository } from '@/repositories/user.repository';
import { ValidationError } from '@/lib/errors';
import { clearAuthCookies } from '@/lib/auth/cookies';
import { prisma } from '@/database/client';

export async function GET(_req: NextRequest) {
  try {
    const session = await getSession();
    const user = await userRepository.findById(session.id);

    return apiSuccess({
      id: user?.id ?? session.id,
      email: user?.email ?? session.email,
      name: user?.name ?? null,
    });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    const body = await req.json();
    const { name } = body;

    if (name !== undefined && (typeof name !== 'string' || name.length > 255)) {
      throw new ValidationError('Name must be 255 characters or fewer', 'name');
    }

    const user = await userRepository.update(session.id, { name: name ?? null });

    return apiSuccess({
      id: user.id,
      email: user.email,
      name: user.name ?? null,
    });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(_req: NextRequest) {
  try {
    const session = await getSession();

    // Cascade delete removes all related: sessions, transcripts, feedback, tokens, resume
    await prisma.user.delete({ where: { id: session.id } });

    // Clear auth cookies so user is logged out
    await clearAuthCookies();

    return apiSuccess({ message: 'Account permanently deleted' });
  } catch (error) {
    return apiError(error);
  }
}
