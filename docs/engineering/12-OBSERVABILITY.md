# Observability

**Product:** InterviewPilot AI
**Document:** Observability Strategy
**Version:** 1.0
**Status:** Draft
**Owner:** Niranjan Sah

---

## 1. Overview

InterviewPilot AI uses structured logging, error tracking, and performance monitoring to provide visibility into system behavior. This document describes what is logged, where it goes, and how to respond to alerts.

---

## 2. The Three Pillars

### Logs

**What:** Structured JSON logs from every route handler and service.
**Where:** Vercel Log Drains → Sentry (errors), Datadog (all logs).
**Tool:** Sentry for errors; Vercel built-in for general logs.

### Metrics

**What:** Quantitative measurements — request counts, latency histograms, error rates.
**Where:** Vercel Analytics (Web Vitals), Sentry (transaction metrics), Supabase (DB metrics).
**Tool:** Sentry + Vercel Analytics.

### Traces

**What:** Distributed request traces linking frontend → API → database.
**Where:** Sentry Performance.
**Tool:** Sentry.

---

## 3. Logging Standards

### What to Log

| Level | When to Use | Example |
|-------|-------------|---------|
| DEBUG | Detailed diagnostic info (dev only) | `Entering handler POST /api/interviews` |
| INFO | Significant business events | `Interview session created`, `User logged in` |
| WARNING | Unexpected but handled situations | `Rate limit approached`, `Token near expiry` |
| ERROR | Unhandled exceptions | `Database connection failed`, `OpenAI API timeout` |

### What Never to Log

- Passwords or password hashes
- JWT access or refresh tokens
- API keys or secrets
- PII (names, emails in logs — use user IDs instead)
- Full request bodies for auth endpoints

### Log Format

```json
{
  "timestamp": "2026-06-29T12:00:00.000Z",
  "level": "info",
  "message": "Interview session created",
  "service": "api",
  "userId": "uuid",
  "sessionId": "uuid",
  "durationMs": 145,
  "requestId": "uuid"
}
```

All logs include a `requestId` (UUID generated at route entry) for correlation.

---

## 4. Error Tracking

### Sentry Configuration

| Setting | Value |
|---------|-------|
| DSN | Configured in environment |
| Traces Sample Rate | 10% on staging, 1% on production |
| Errors Sample Rate | 100% |
| Environment | Injected via `SENTRY_ENVIRONMENT` |

### Error Breadcrumbs

Sentry automatically captures breadcrumbs (recent log entries, HTTP requests) before each error. Do not manually append breadcrumbs — rely on the automatic ones.

### Capturing Errors

```typescript
import * as Sentry from '@sentry/nextjs';

// In error boundary components:
Sentry.captureException(error, { extra: { userId, sessionId } });
```

---

## 5. Key Metrics

### Business Metrics

| Metric | Target | Alert Threshold |
|--------|--------|----------------|
| Interview completion rate | > 85% | < 70% |
| Average interview duration | 15–25 min | < 5 min or > 45 min |
| Daily active users | — | > 20% drop from baseline |
| New signups | — | > 50% drop from baseline |

### Technical Metrics

| Metric | Target | Alert Threshold |
|--------|--------|----------------|
| API error rate | < 1% | > 5% |
| API p95 latency | < 500ms | > 2s |
| AI response latency | < 2s | > 5s |
| Database query time (avg) | < 50ms | > 200ms |
| Build success rate | 100% | < 95% |

---

## 6. Alerting

### Sentry Alerts

| Alert | Condition | Severity | Action |
|-------|-----------|----------|--------|
| High error rate | > 5% errors in 5 min | Critical | Page on-call + #incidents |
| Performance regression | p95 > 2s for 10 min | Warning | Slack #engineering |
| New issue spike | > 10 new issues in 1 hour | Warning | Slack #engineering |

### Uptime Monitoring

- Vercel provides built-in health checks.
- Supplement with [UptimeRobot](https://uptimerobot.com/) for external monitoring:
  - `GET /api/health` every 5 minutes
  - Alert if 2 consecutive failures

---

## 7. Dashboards

| Dashboard | URL | Contents |
|-----------|-----|---------|
| Vercel Analytics | Vercel Dashboard | Web Vitals, request counts, geography |
| Sentry | sentry.io/organizations/interviewpilot | Errors, performance, issues |
| Supabase | supabase.com/dashboard | DB size, connection count, query performance |
| OpenAI | platform.openai.com | API usage, quota, errors |

---

## 8. Related Documents

- [08-DEPLOYMENT.md](08-DEPLOYMENT.md)
- [09-PERFORMANCE.md](09-PERFORMANCE.md)
- [docs/runbooks/incident-response.md](../runbooks/incident-response.md)
