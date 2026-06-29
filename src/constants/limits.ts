/**
 * Rate limits and other system limits.
 */

export const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
export const RATE_LIMIT_MAX_REQUESTS = 100; // per window
export const AUTH_RATE_LIMIT_MAX = 10; // per window (stricter for auth endpoints)

export const PAGINATION_DEFAULT_LIMIT = 10;
export const PAGINATION_MAX_LIMIT = 50;

export const INTERVIEW_MAX_DURATION_SECONDS = 30 * 60; // 30 minutes
export const INTERVIEW_MIN_DURATION_SECONDS = 5 * 60; // 5 minutes
export const INTERVIEW_CHUNK_SIZE_MS = 100; // audio chunk size
