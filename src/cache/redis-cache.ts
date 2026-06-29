/**
 * Redis cache provider — production implementation of CacheProvider.
 * Falls back to MemoryCache if Redis is unavailable.
 * Always tries Redis first, then catches failures → memory.
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
  private redis: Redis;
  private fallback: MemoryCache;
  private connected = false;
  private readonly prefix: string;

  constructor(private config: RedisCacheConfig) {
    this.prefix = config.keyPrefix ?? 'ip:';
    this.fallback = new MemoryCache();

    this.redis = new Redis(config.url, {
      maxRetriesPerRequest: config.maxRetries ?? 3,
      lazyConnect: true,
      enableReadyCheck: true,
      retryStrategy(times) {
        if (times > 5) return null;
        return Math.min(times * 200, 2000);
      },
    });

    this.redis.on('connect', () => {
      this.connected = true;
      cacheLogger.info({ msg: 'Redis connected' });
    });

    this.redis.on('error', (err) => {
      this.connected = false;
      cacheLogger.warn({ msg: 'Redis error — falling back to memory', error: err.message });
    });

    this.redis.on('close', () => {
      this.connected = false;
      cacheLogger.warn({ msg: 'Redis connection closed' });
    });

    this.redis.connect().then(() => {
      this.connected = true;
    }).catch(() => {
      this.connected = false;
      cacheLogger.warn({ msg: 'Redis connect failed — using memory fallback' });
    });
  }

  private key(raw: string): string {
    return `${this.prefix}${raw}`;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await this.redis.get(this.key(key));
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return this.fallback.get<T>(key);
    }
  }

  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    try {
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
      await this.redis.del(this.key(key));
    } catch {
      // best effort
    }
    await this.fallback.delete(key);
  }

  async deletePattern(pattern: string): Promise<void> {
    try {
      const prefixedPattern = this.key(pattern);
      const stream = this.redis.scanStream({ match: prefixedPattern, count: 100 });
      const pipeline = this.redis.pipeline();

      for await (const keys of stream) {
        if (keys.length > 0) {
          pipeline.del(...(keys as string[]));
        }
      }
      await pipeline.exec();
    } catch {
      // best effort
    }
    await this.fallback.deletePattern(pattern);
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(this.key(key));
      return result === 1;
    } catch {
      return this.fallback.exists(key);
    }
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

  async getMetrics(): Promise<Record<string, unknown>> {
    try {
      if (this.connected) {
        const dbsize = await this.redis.dbsize();
        return { connected: true, dbSize: dbsize };
      }
    } catch {
      // fall through
    }
    return { connected: false, fallback: 'memory', memorySize: this.fallback.size };
  }

  async disconnect(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
      this.connected = false;
    }
  }
}
