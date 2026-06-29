/**
 * Cookie utilities — secure HTTP-only cookie helpers.
 * All cookie setting/reading goes through this module.
 */

import { cookies } from 'next/headers';
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  secure: process.env.NODE_ENV === 'production',
};

export const ACCESS_TOKEN_COOKIE = 'ip_access_token';
export const REFRESH_TOKEN_COOKIE = 'ip_refresh_token';
export const CSRF_TOKEN_COOKIE = 'ip_csrf';

/**
 * Set access token cookie.
 * 15 minute expiry.
 */
export async function setAccessTokenCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ACCESS_TOKEN_COOKIE, token, {
    ...COOKIE_OPTIONS,
    maxAge: 60 * 15, // 15 minutes
  });
}

/**
 * Set refresh token cookie.
 * 7 day expiry.
 */
export async function setRefreshTokenCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(REFRESH_TOKEN_COOKIE, token, {
    ...COOKIE_OPTIONS,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

/**
 * Get access token from cookie.
 */
export async function getAccessToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
}

/**
 * Get refresh token from cookie.
 */
export async function getRefreshToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
}

/**
 * Get CSRF token from cookie.
 */
export async function getCsrfToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(CSRF_TOKEN_COOKIE)?.value;
}

/**
 * Delete all auth cookies.
 */
export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
  cookieStore.delete(CSRF_TOKEN_COOKIE);
}

/**
 * Get cookie store (for server-side use).
 */
export async function getCookieStore(): Promise<ReadonlyRequestCookies> {
  return cookies();
}
