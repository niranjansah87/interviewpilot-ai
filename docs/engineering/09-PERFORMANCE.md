# Performance

**Product:** InterviewPilot AI
**Document:** Performance Targets & Optimization Guide
**Version:** 1.0
**Status:** Draft
**Owner:** Niranjan Sah

---

## 1. Overview

InterviewPilot AI requires near real-time performance for voice conversations and sub-second response times for API interactions. This document defines performance targets, measurement approaches, and optimization strategies.

---

## 2. Performance Targets

### API Response Times

| Endpoint Category | Target (p95) | Target (p99) |
|-------------------|-------------|-------------|
| Auth (login/register) | < 500ms | < 1s |
| Dashboard page load | < 1s | < 2s |
| Interview list | < 300ms | < 600ms |
| Interview start (session init) | < 3s | < 5s |
| AI response (voice round-trip) | < 2s | < 3s |
| Feedback generation | < 5s | < 10s |
| Report retrieval | < 200ms | < 400ms |

### Frontend Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| LCP (Largest Contentful Paint) | < 2.5s | Web Vitals |
| FID (First Input Delay) | < 100ms | Web Vitals |
| CLS (Cumulative Layout Shift) | < 0.1 | Web Vitals |
| TTFB (Time to First Byte) | < 600ms | Web Vitals |
| INP (Interaction to Next Paint) | < 200ms | Web Vitals |

### Voice Performance

| Metric | Target |
|--------|--------|
| Voice round-trip latency | < 2s (p95) |
| Time to first audio byte | < 500ms |
| Audio dropout rate | < 0.1% |
| Concurrent interview sessions | 50+ |

---

## 3. Performance Measurement

### Tools

| Tool | Purpose |
|------|---------|
| Vercel Analytics | Core Web Vitals, page performance |
| Sentry | Error rates, transaction performance |
| Supabase Dashboard | Database query performance |
| OpenAI Dashboard | AI API latency and quotas |

### Key Dashboards

- **Vercel**: https://vercel.com/dashboard → Project → Analytics
- **Sentry**: https://sentry.io/organizations/interviewpilot
- **Supabase**: https://supabase.com/dashboard → Project → Reports

---

## 4. Optimization Strategies

### Database

| Pattern | Implementation |
|---------|---------------|
| Connection pooling | PgBouncer (Supabase handles this) |
| Indexed queries | All foreign keys and frequently filtered columns |
| Pagination | All list endpoints; max 50 items per page |
| Projection | Never `SELECT *` in API handlers |

### API

| Pattern | Implementation |
|---------|---------------|
| Async handlers | All route handlers are `async` |
| Response compression | Vercel handles gzip/br automatically |
| Caching headers | Cache-Control for static assets, no-cache for API |
| Query optimization | Prisma `select` for minimal payload |

### Frontend

| Pattern | Implementation |
|---------|---------------|
| Route-based code splitting | Next.js automatic |
| Component lazy loading | `next/dynamic` with `ssr: false` for heavy components |
| Image optimization | `next/image` for all images |
| Font optimization | `next/font` for Inter |
| React Query caching | Stale time 5min, cache time 10min |

### Voice Optimization

| Pattern | Implementation |
|---------|---------------|
| Audio chunking | 100ms chunks balance latency vs. overhead |
| Pre-buffering | Fetch next prompt while playing current response |
| Connection keep-alive | WebSocket ping/pong to prevent disconnection |
| Fallback | Graceful degradation to reconnect on audio dropout |

---

## 5. Load Testing

Before production launch, conduct load tests targeting:

- **50 concurrent interview sessions**
- **100 concurrent API users**
- **Sustained 15-minute peak load**

Use [k6](https://k6.io/) or [Loader.io](https://loader.io/) for testing.

---

## 6. Performance Budget

Per-page JavaScript bundle sizes:

| Page | Budget |
|------|--------|
| Landing | < 100 KB |
| Dashboard | < 150 KB |
| Interview | < 200 KB |
| Report | < 150 KB |

Enforced via `@next/bundle-analyzer` in CI.

---

## 7. Related Documents

- [08-DEPLOYMENT.md](08-DEPLOYMENT.md)
- [12-OBSERVABILITY.md](12-OBSERVABILITY.md)
- [Vercel Analytics](https://vercel.com/docs/concepts/analytics)
