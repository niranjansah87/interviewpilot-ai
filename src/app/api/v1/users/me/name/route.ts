import { type NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api/route-helpers';
import { getSession } from '@/lib/api/get-session';
import { userRepository } from '@/repositories/user.repository';
import { ValidationError } from '@/lib/errors';

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    const { name } = await req.json();

    if (name !== undefined && (typeof name !== 'string' || name.length > 255)) {
      throw new ValidationError('Name must be 255 characters or fewer', 'name');
    }

    const user = await userRepository.update(session.id, { name: name ?? null });

    return apiSuccess({
      id: user.id,
      email: user.email,
      name: user.name,
    });
  } catch (error) {
    return apiError(error);
  }
}
