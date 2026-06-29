/**
 * Redis cache provider — production implementation of CacheProvider.
 * Falls back to MemoryCache if Redis is unavailable.
 */

import Redis from 'ioredis';
import type { CacheOptions, CacheProvider } from './provider';
import { MemoryCache } from './memory-cache';
import { logger } from '@/monitoring/logger';

const cacheLogger = logger.child({ component: 'redis-cache' });

interface RedisCacheConfig {
  url: string;
  keyPrefix?: string;
  defaultTTLSeconds?: number;
  maxRetries?: number;
}

export class RedisCache implements CacheProvider {
  private redis: Redis | null = null;
  private fallback: MemoryCache;
  private connected = false;
  private readonly prefix: string;

  constructor(private config: RedisCacheConfig) {
    this.prefix = config.keyPrefix ?? 'ip:';
    this.fallback = new MemoryCache();

    try {
      this.redis = new Redis(config.url, {
        maxRetriesPerRequest: config.maxRetries ?? 3,
        lazyConnect: true,
        enableReadyCheck: true,
        retryStrategy(times) {
          if (times > 5) return null; // stop retrying
          return Math.min(times * 200, 2000);
        },
      });

      this.redis.on('connect', () => {
        this.connected = true;
        cacheLogger.info({ msg: 'Redis connected' });
      });

      this.redis.on('error', (err) => {
        this.connected = false;
        cacheLogger.warn({ msg: 'Redis error — falling back to memory cache', error: err.message });
      });

      this.redis.on('close', () => {
        this.connected = false;
        cacheLogger.warn({ msg: 'Redis connection closed' });
      });

      // Connect lazily — first operation will trigger connect
      this.redis.connect().catch(() => {
        this.connected = false;
      });
    } catch (error) {
      cacheLogger.warn({ msg: 'Redis unavailable — using memory cache', error: String(error) });
      this.redis = null;
      this.connected = false;
    }
  }

  private key(raw: string): string {
    return `${this.prefix}${raw}`;
  }

  private get active(): CacheProvider {
    return this.connected && this.redis ? this : this.fallback;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      if (!this.connected || !this.redis) return this.fallback.get<T>(key);

      const raw = await this.redis.get(this.key(key));
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return this.fallback.get<T>(key);
    }
  }

  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    try {
      if (!this.connected || !this.redis) {
        return this.fallback.set(key, value, options);
      }

      const serialized = JSON.stringify(value);
      const prefixedKey = this.key(key);

      if (options?.ttlSeconds != null && options.ttlSeconds > 0) {
        await this.redis.setex(prefixedKey, options.ttlSeconds, serialized);
      } else {
        await this.redis.set(prefixedKey, serialized);
      }
    } catch {
      await this.fallback.set(key, value, options);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      if (this.connected && this.redis) {
        await this.redis.del(this.key(key));
      }
    } catch {
      // Best effort
    }
    await this.fallback.delete(key);
  }

  async deletePattern(pattern: string): Promise<void> {
    try {
      if (this.connected && this.redis) {
        const prefixedPattern = this.key(pattern);
        // SCAN to avoid blocking
        const stream = this.redis.scanStream({ match: prefixedPattern, count: 100 });
        const pipeline = this.redis.pipeline();

        for await (const keys of stream) {
          if (keys.length > 0) {
            pipeline.del(...(keys as string[]));
          }
        }
        await pipeline.exec();
      }
    } catch {
      // Best effort
    }
    await this.fallback.deletePattern(pattern);
  }

  async exists(key: string): Promise<boolean> {
    try {
      if (this.connected && this.redis) {
        const result = await this.redis.exists(this.key(key));
        return result === 1;
      }
    } catch {
      // fall through
    }
    return this.fallback.exists(key);
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

  /**
   * Get cache health metrics.
   */
  async getMetrics(): Promise<Record<string, unknown>> {
    try {
      if (this.connected && this.redis) {
        const info = await this.redis.info('stats');
        const dbsize = await this.redis.dbsize();
        return {
          connected: true,
          dbSize: dbsize,
          info: info.substring(0, 500), // Truncate for logging
        };
      }
    } catch {
      // fall through
    }
    return { connected: false, fallback: 'memory', memorySize: this.fallback.size };
  }

  /**
   * Gracefully close Redis connection.
   */
  async disconnect(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
      this.connected = false;
    }
  }
}
