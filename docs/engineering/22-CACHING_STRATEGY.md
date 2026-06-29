# Caching Strategy

**Product:** InterviewPilot AI
**Document:** Caching Strategy
**Version:** 1.0
**Status:** Draft
**Owner:** Niranjan Sah

---

## 1. Philosophy

Cache only what improves user-perceived performance or reduces infrastructure cost. Cache aggressively on reads, invalidate carefully on writes. Never cache what changes frequently without a clear invalidation strategy.

---

## 2. Cache Abstraction

All cache access goes through a `CacheProvider` interface. This makes swapping implementations (in-memory → Redis → Memcached) a one-file change.

```typescript
// src/cache/provider.ts
export interface CacheProvider {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, options?: CacheOptions): Promise<void>;
  delete(key: string): Promise<void>;
  deletePattern(pattern: string): Promise<void>;
  exists(key: string): Promise<boolean>;
}

export interface CacheOptions {
  ttlSeconds?: number;
  staleWhileRevalidate?: boolean;
}
```

Implementations:
- `src/cache/memory-cache.ts` — development only
- `src/cache/redis-cache.ts` — production

---

## 3. Memory Cache (Development)

```typescript
// src/cache/memory-cache.ts
// Singleton in-process LRU cache.
// NOT thread-safe. NOT for production.
// Max 1000 entries, auto-evicts least-recently-used.
```

### When to Use

- Development without Redis
- Small, non-critical data
- Unit tests

### When NOT to Use

- Production
- Multi-instance deployments
- Persistent data

---

## 4. Redis Migration (Production)

### Trigger

Switch from memory to Redis when:
- Second server instance is added
- Cache persistence across restarts is needed
- Cache sharing between processes is required

### Implementation

```typescript
// src/cache/redis-cache.ts
// Uses ioredis or @redis/client
// Connection pooled via Redis connection pool
// Pipeline support for bulk operations
```

### Configuration

```typescript
const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  enableReadyCheck: true,
});
```

---

## 5. Cache Layers

```
Request
  │
  ▼
┌─────────────────┐
│  In-Memory LRU   │  ← Process-local, microseconds
│  (hot data)     │
└────────┬────────┘
         │ miss
         ▼
┌─────────────────┐
│     Redis        │  ← Shared, ~1ms
│  (warm data)    │
└────────┬────────┘
         │ miss
         ▼
┌─────────────────┐
│   PostgreSQL     │  ← Source of truth, ~10ms
│  (cold data)    │
└─────────────────┘
```

---

## 6. TTL Strategy

| Data Type | TTL | Rationale |
|-----------|-----|-----------|
| User session | 15 min | Matches JWT access token |
| Interview config | 1 hour | Rarely changes |
| Feedback report | 24 hours | Immutable once generated |
| Transcript | No cache | Write-heavy, read once |
| AI prompts (system) | 1 hour | Rarely changes |
| Rate limit counters | 1 min | Rolling window |
| Static assets | 1 year | Immutable |

---

## 7. Cache Invalidation

### Patterns

| Pattern | When | Method |
|---------|------|--------|
| Cache-aside | On read | `getOrSet(key, fetch)` |
| Write-through | On write | Write DB, then update cache |
| Write-behind | On write | Write to DB, async cache update |
| TTL expiry | Time-based | Set `expiresAt` on write |

### Invalidation Triggers

| Event | Invalidates |
|-------|------------|
| User updates profile | `user:{id}`, `user:session:{userId}` |
| Interview ends | `interview:{id}`, `interview:list:{userId}` |
| Feedback generated | `feedback:{sessionId}` |
| Admin updates config | `app:config:*` |

### Cache Tags (Future)

For Redis: use `HSET` with tag members for bulk invalidation.

```
cache:set_tag("interview:123", "session", "feedback")
cache:invalidate_tag("session")  → removes all interview:123 entries
```

---

## 8. Cache Keys

All cache keys follow the format:

```
{entity}:{id}:{subresource}:{variant}
```

| Key Pattern | TTL | Description |
|-------------|-----|-------------|
| `user:{id}` | 15 min | User profile |
| `user:{id}:sessions` | 5 min | User session list |
| `interview:{id}` | 1 hour | Interview metadata |
| `interview:{id}:transcript` | 24 hours | Full transcript |
| `feedback:{sessionId}` | 24 hours | Feedback report |
| `ratelimit:{ip}:{endpoint}` | 1 min | Rate limit counter |
| `config:app` | 1 hour | App configuration |

---

## 9. Repository Caching

Repositories wrap cache + database:

```typescript
class UserRepository {
  constructor(private cache: CacheProvider) {}

  async findById(id: string): Promise<User | null> {
    const cacheKey = `user:${id}`;
    const cached = await this.cache.get<User>(cacheKey);
    if (cached) return cached;

    const user = await prisma.user.findUnique({ where: { id } });
    if (user) await this.cache.set(cacheKey, user, { ttlSeconds: 900 });
    return user;
  }

  async update(id: string, data: UpdateUserInput): Promise<User> {
    const user = await prisma.user.update({ where: { id }, data });
    await this.cache.delete(`user:${id}`);
    return user;
  }
}
```

---

## 10. AI Caching

### System Prompts

Cache compiled prompt templates.

```
prompts:system:{type}:{version}
TTL: 1 hour
Invalidate: on version change
```

### LLM Responses (Non-Realtime)

Cache GPT-4 responses for repeated question patterns.

```
llm:response:{hash(prompt)}
TTL: 24 hours
Note: Only for non-realtime, non-conversational calls
```

### Realtime API

Do NOT cache OpenAI Realtime API responses. Every conversation is unique and context-dependent.

---

## 11. Analytics Caching

Aggregate metrics cached aggressively:

| Metric | Granularity | TTL |
|--------|------------|-----|
| Daily interview count | 1 day | 1 hour |
| Average feedback score | 7 days | 1 hour |
| User activity | 30 days | 15 min |

Raw events are never cached — written directly to the analytics store.

---

## 12. Future: Distributed Caching

When Redis is introduced:

1. Move all cache to Redis from day one
2. Add local L2 cache (Caffeine) for hot keys
3. Use Redis pub/sub for cache invalidation across instances
4. Consider cache tags for bulk invalidation
5. Monitor hit rate — target > 90% for hot data

### Key Distribution

```
instance_1: keys → [a-m]
instance_2: keys → [n-z]
```

Use consistent hashing for key distribution across Redis cluster nodes.

---

## 13. Monitoring

Track per-cache-metrics:

| Metric | Alert Threshold |
|--------|---------------|
| Hit rate | < 80% |
| Memory usage | > 80% |
| Latency (p99) | > 10ms |
| Eviction rate | > 100/sec |

---

## 14. Related Documents

- [09-PERFORMANCE.md](09-PERFORMANCE.md)
- [12-OBSERVABILITY.md](12-OBSERVABILITY.md)
- [src/cache/provider.ts](../src/cache/provider.ts)
