import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/services/auth.service';
import { apiSuccess, apiError } from '@/lib/api/route-helpers';
import { getRefreshToken } from '@/lib/auth/cookies';
import { setAccessTokenCookie, setRefreshTokenCookie } from '@/lib/auth/cookies';
import { AuthenticationError } from '@/lib/errors';

export async function POST(_req: NextRequest) {
  try {
    const token = await getRefreshToken();
    if (!token) {
      throw new AuthenticationError('No refresh token provided');
    }

    const result = await authService.refresh(token);

    const response = NextResponse.json(
      { data: { user: result.user }, requestId: crypto.randomUUID?.() ?? 'unknown' },
      { status: 200 },
    );

    await setAccessTokenCookie(result.accessToken);
    await setRefreshTokenCookie(result.refreshToken);

    return response;
  } catch (error) {
    return apiError(error);
  }
}
