import { type NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api/route-helpers';
import { getSession } from '@/lib/api/get-session';
import { userRepository } from '@/repositories/user.repository';

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
