/**
 * In-process LRU memory cache.
 *
 * WARNING: This is a development-only implementation.
 * NOT suitable for production or multi-instance deployments.
 * NOT thread-safe.
 *
 * - Max 1000 entries (configurable)
 * - Auto-evicts least-recently-used entry on overflow
 * - No persistence across process restarts
 */

import type { CacheOptions, CacheProvider } from './provider';

interface CacheEntry<T> {
  value: T;
  expiresAt: number | null;
}

export class MemoryCache implements CacheProvider {
  private store = new Map<string, CacheEntry<unknown>>();
  private accessOrder: string[] = [];
  private readonly maxEntries: number;

  constructor(maxEntries = 1000) {
    this.maxEntries = maxEntries;
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;

    if (!entry) return null;

    if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.removeFromAccessOrder(key);
      return null;
    }

    this.touch(key);
    return entry.value;
  }

  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    this.evictIfNeeded();

    const ttlMs = options?.ttlSeconds != null ? options.ttlSeconds * 1000 : null;
    const expiresAt = ttlMs !== null ? Date.now() + ttlMs : null;

    this.store.set(key, { value, expiresAt });
    this.touch(key);
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
    this.removeFromAccessOrder(key);
  }

  async deletePattern(pattern: string): Promise<void> {
    const regex = this.patternToRegex(pattern);
    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key);
        this.removeFromAccessOrder(key);
      }
    }
  }

  async exists(key: string): Promise<boolean> {
    const val = await this.get(key);
    return val !== null;
  }

  async getOrSet<T>(
    key: string,
    fetch: () => Promise<T>,
    options?: CacheOptions,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;

    const value = await fetch();
    await this.set(key, value, options);
    return value;
  }

  /** Move key to end of access order (most recently used). */
  private touch(key: string): void {
    this.removeFromAccessOrder(key);
    this.accessOrder.push(key);
  }

  /** Remove key from access order array. */
  private removeFromAccessOrder(key: string): void {
    const idx = this.accessOrder.indexOf(key);
    if (idx !== -1) this.accessOrder.splice(idx, 1);
  }

  /** Evict LRU entry if over capacity. */
  private evictIfNeeded(): void {
    while (this.store.size >= this.maxEntries && this.accessOrder.length > 0) {
      const lru = this.accessOrder.shift()!;
      this.store.delete(lru);
    }
  }

  /** Convert glob pattern to RegExp. */
  private patternToRegex(pattern: string): RegExp {
    const escaped = pattern
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*');
    return new RegExp(`^${escaped}$`);
  }

  /** Clear all entries. Useful for testing. */
  clear(): void {
    this.store.clear();
    this.accessOrder = [];
  }

  /** Return current entry count. */
  get size(): number {
    return this.store.size;
  }
}

/** Singleton instance for process-wide use in development. */
export const memoryCache = new MemoryCache();
