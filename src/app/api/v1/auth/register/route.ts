import { NextRequest } from 'next/server';
import { authService } from '@/services/auth.service';
import { registerSchema } from '@/validators/common';
import { apiSuccess, apiError, ValidationError } from '@/lib/api/route-helpers';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError(
        parsed.error.issues[0]?.message ?? 'Invalid input',
        parsed.error.issues[0]?.path.join('.'),
      );
    }

    const user = await authService.register(parsed.data);
    return apiSuccess(user, 201);
  } catch (error) {
    return apiError(error);
  }
}
