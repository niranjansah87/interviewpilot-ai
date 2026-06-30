import { type NextRequest } from 'next/server';
import { authService } from '@/services/auth.service';
import { apiSuccess, apiError } from '@/lib/api/route-helpers';
import { clearAuthCookies, getRefreshToken } from '@/lib/auth/cookies';

async function handleLogout() {
  try {
    const token = await getRefreshToken();
    if (token) {
      await authService.logout(token);
    }
    await clearAuthCookies();
    return apiSuccess({ message: 'Logged out successfully' });
  } catch {
    await clearAuthCookies();
    return apiSuccess({ message: 'Logged out successfully' });
  }
}

export async function POST(_req: NextRequest) { return handleLogout(); }
export async function GET(_req: NextRequest) { return handleLogout(); }
