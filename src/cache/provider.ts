/**
 * Cache provider interface.
 * All cache access goes through this contract.
 * Swap implementations (memory → Redis) without changing call sites.
 */

export interface CacheOptions {
  /** Time-to-live in seconds. Default: no expiry. */
  ttlSeconds?: number;
}

export interface CacheProvider {
  /**
   * Get a value from cache.
   * Returns null if the key does not exist.
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * Set a value in cache.
   * If ttlSeconds is provided, the entry expires after that duration.
   */
  set<T>(key: string, value: T, options?: CacheOptions): Promise<void>;

  /**
   * Delete a single key from cache.
   */
  delete(key: string): Promise<void>;

  /**
   * Delete all keys matching a glob pattern.
   * Pattern uses * as wildcard.
   */
  deletePattern(pattern: string): Promise<void>;

  /**
   * Check if a key exists in cache.
   */
  exists(key: string): Promise<boolean>;

  /**
   * Get and set: return cached value or fetch and cache it.
   * Reduces boilerplate for cache-aside patterns.
   */
  getOrSet<T>(
    key: string,
    fetch: () => Promise<T>,
    options?: CacheOptions,
  ): Promise<T>;
}
