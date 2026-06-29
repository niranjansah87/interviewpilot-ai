/**
 * Cache Manager — selects the appropriate cache provider at runtime.
 * Uses Redis in production, falls back to memory cache.
 */

import { getEnv } from '@/config/env';
import { MemoryCache } from './memory-cache';
import { RedisCache } from './redis-cache';
import type { CacheOptions, CacheProvider } from './provider';
import { logger } from '@/monitoring/logger';

export type { CacheProvider, CacheOptions } from './provider';

let cacheInstance: CacheProvider | null = null;

export function getCache(): CacheProvider {
  if (cacheInstance) return cacheInstance;

  const env = getEnv();

  // Try Redis if configured
  if (env.CACHE_PROVIDER === 'redis' && env.REDIS_URL) {
    try {
      const redisCache = new RedisCache({ url: env.REDIS_URL, keyPrefix: 'ip:' });
      cacheInstance = redisCache;
      logger.info({ msg: 'Using Redis cache' });
      return cacheInstance;
    } catch (error) {
      logger.warn({ msg: 'Redis unavailable, falling back to memory', error: String(error) });
    }
  }

  // Default: in-memory cache
  cacheInstance = new MemoryCache();
  logger.info({ msg: 'Using in-memory cache' });
  return cacheInstance;
}

/** Global cache accessor */
export const cache = {
  get: <T>(key: string) => getCache().get<T>(key),
  set: <T>(key: string, value: T, options?: CacheOptions) =>
    getCache().set(key, value, options),
  delete: (key: string) => getCache().delete(key),
  deletePattern: (pattern: string) => getCache().deletePattern(pattern),
  exists: (key: string) => getCache().exists(key),
  getOrSet: <T>(key: string, fetch: () => Promise<T>, options?: CacheOptions) =>
    getCache().getOrSet(key, fetch, options),
};
