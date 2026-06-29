/**
 * Extract the authenticated user from the request.
 * Used by protected route handlers.
 */

import { verifyAccessToken } from '@/lib/auth/jwt';
import { getAccessToken } from '@/lib/auth/cookies';
import { AuthenticationError } from '@/lib/errors';

export interface SessionUser {
  id: string;
  email: string;
}

export async function getSession(): Promise<SessionUser> {
  const token = await getAccessToken();
  if (!token) {
    throw new AuthenticationError('Authentication required');
  }

  const payload = await verifyAccessToken(token);
  return { id: payload.sub, email: payload.email ?? '' };
}
