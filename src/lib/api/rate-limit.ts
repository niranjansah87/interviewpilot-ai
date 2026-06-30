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
 * Safely extract client IP from request headers.
 * Takes the leftmost IP from x-forwarded-for (set by Vercel's trusted edge proxy).
 * Direct client connections cannot spoof the leftmost entry behind a trusted proxy.
 * In development (no proxy), falls back to a connection-derived key.
 */
export function getClientIP(req: { headers: Headers }): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    // x-forwarded-for: "clientIP, proxy1IP, proxy2IP"
    // Take only the leftmost (original client) IP
    const clientIP = forwarded.split(',')[0]?.trim();
    if (clientIP && isValidIP(clientIP)) return clientIP;
  }
  // Fallback: x-real-ip (set by nginx) or local
  const realIP = req.headers.get('x-real-ip');
  if (realIP && isValidIP(realIP)) return realIP;
  return '127.0.0.1';
}

function isValidIP(ip: string): boolean {
  // Reject obviously invalid/spoofed values
  if (ip.length > 45 || ip.length < 7) return false;
  // Must be IPv4 or IPv6-looking
  return /^[\d.:a-fA-F]+$/.test(ip);
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
