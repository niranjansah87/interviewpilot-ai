/**
 * Session utilities.
 * Currently a placeholder — real session management
 * requires a database model for sessions.
 */

import { verifyAccessToken } from './jwt';

export interface SessionUser {
  id: string;
  email: string;
}

/**
 * Get the current authenticated user from a request.
 * Returns null if not authenticated.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  // TODO: Implement with real auth flow
  return null;
}

/**
 * Require authentication — throws if not authenticated.
 */
export async function requireSession(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}
