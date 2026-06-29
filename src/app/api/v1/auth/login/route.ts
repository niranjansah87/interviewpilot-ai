import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/services/auth.service';
import { loginSchema } from '@/validators/common';
import { apiSuccess, apiError, ValidationError } from '@/lib/api/route-helpers';
import { setAccessTokenCookie, setRefreshTokenCookie } from '@/lib/auth/cookies';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError(
        parsed.error.issues[0]?.message ?? 'Invalid input',
        parsed.error.issues[0]?.path.join('.'),
      );
    }

    const result = await authService.login(parsed.data);

    const response = NextResponse.json(
      { data: { user: result.user } },
      { status: 200 },
    );

    await setAccessTokenCookie(result.accessToken);
    await setRefreshTokenCookie(result.refreshToken);

    return response;
  } catch (error) {
    return apiError(error);
  }
}
