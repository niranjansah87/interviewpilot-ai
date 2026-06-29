/**
 * Cookie constants.
 */

export const ACCESS_TOKEN_COOKIE = 'ip_access_token';
export const REFRESH_TOKEN_COOKIE = 'ip_refresh_token';
export const CSRF_TOKEN_COOKIE = 'ip_csrf';

export const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  secure: process.env.NODE_ENV === 'production',
} as const;

export const ACCESS_TOKEN_MAX_AGE = 60 * 15; // 15 minutes
export const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
