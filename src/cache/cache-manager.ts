/**
 * Cache manager — selects the appropriate cache provider at runtime.
 * Import `cache` from this file throughout the application.
 */

import { getEnv } from '@/config/env';
import { MemoryCache } from './memory-cache';
import type { CacheOptions, CacheProvider } from './provider';

// Re-export the interface
export type { CacheProvider, CacheOptions } from './provider';

// Singleton instance
let cacheInstance: CacheProvider | null = null;

/**
 * Returns the configured cache provider.
 * Initializes on first call.
 *
 * In development: MemoryCache
 * In production with REDIS_URL: RedisCache (future)
 * In production without REDIS_URL: MemoryCache (with warning)
 */
export function getCache(): CacheProvider {
  if (cacheInstance) return cacheInstance;

  const env = getEnv();

  if (env.CACHE_PROVIDER === 'redis') {
    // TODO: Initialize RedisCache when REDIS_URL is configured
    // import('./redis-cache').then(({ redisCache }) => {
    //   cacheInstance = redisCache;
    // });
    throw new Error('Redis cache not yet implemented — set CACHE_PROVIDER=memory');
  }

  // Default: in-memory cache
  cacheInstance = new MemoryCache();
  return cacheInstance;
}

/** Global cache accessor — use throughout the application. */
export const cache = {
  get: <T>(key: string) => getCache().get<T>(key),
  set: <T>(key: string, value: T, options?: Parameters<CacheProvider['set']>[2]) =>
    getCache().set(key, value, options),
  delete: (key: string) => getCache().delete(key),
  deletePattern: (pattern: string) => getCache().deletePattern(pattern),
  exists: (key: string) => getCache().exists(key),
  getOrSet: <T>(
    key: string,
    fetch: () => Promise<T>,
    options?: CacheOptions,
  ) => getCache().getOrSet(key, fetch, options),
};
