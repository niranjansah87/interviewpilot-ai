/**
 * Rate limiting utility — uses in-memory counters (Redis in production).
 * Protects auth endpoints from brute force attacks.
 */

import { RateLimitError } from '@/lib/errors';

interface RateLimitStore {
  [key: string]: { count: number; resetAt: number };
}

const store: RateLimitStore = {};

// Cleanup stale entries every 60 seconds
setInterval(() => {
  const now = Date.now();
  for (const key of Object.keys(store)) {
    if (store[key]?.resetAt && store[key]!.resetAt < now) {
      delete store[key];
    }
  }
}, 60_000);

/**
 * Check rate limit for a key. Throws RateLimitError if exceeded.
 */
export function checkRateLimit(
  key: string,
  maxRequests = 10,
  windowSeconds = 15 * 60,
): void {
  const now = Date.now();
  const entry = store[key];

  if (!entry || entry.resetAt < now) {
    store[key] = { count: 1, resetAt: now + windowSeconds * 1000 };
    return;
  }

  entry.count++;

  if (entry.count > maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    throw new RateLimitError(retryAfter);
  }
}

/**
 * Rate limit by IP for auth endpoints.
 */
export function authRateLimit(ip: string): void {
  checkRateLimit(`auth:${ip}`, 10, 15 * 60); // 10 attempts per 15 min
}

/**
 * Rate limit by IP for general API.
 */
export function apiRateLimit(ip: string): void {
  checkRateLimit(`api:${ip}`, 100, 60); // 100 requests per minute
}
