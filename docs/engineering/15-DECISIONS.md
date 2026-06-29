# Decisions

**Product:** InterviewPilot AI
**Document:** Architecture Decision Index
**Version:** 1.0
**Status:** Draft
**Owner:** Niranjan Sah

---

## 1. Overview

This document serves as the index and summary of all Architecture Decision Records (ADRs) for InterviewPilot AI. ADRs capture significant technical decisions, their rationale, and their consequences.

---

## 2. Decision Index

| ID | Title | Status | Date |
|----|-------|--------|------|
| [0001](../decisions/0001-nextjs.md) | Next.js as Frontend Framework | ✅ Accepted | 2026-06-21 |
| [0002](../decisions/0002-openai-realtime.md) | OpenAI Realtime API for Voice | ✅ Accepted | 2026-06-21 |
| [0003](../decisions/0003-prisma.md) | Prisma as Database ORM | ✅ Accepted | 2026-06-21 |
| [0004](../decisions/0004-postgres.md) | PostgreSQL as Primary Database | ✅ Accepted | 2026-06-21 |
| [0005](../decisions/0005-jwt-auth.md) | JWT for Authentication | ✅ Accepted | 2026-06-21 |

---

## 3. Decision Summaries

### ADR-0001: Next.js as Frontend Framework

**Decision:** Use Next.js 16 with App Router and Route Handlers as the API layer.

**Key Rationale:** Single deployment unit, Server Components for improved performance, Vercel integration, and team's familiarity with Next.js.

**Consequences:** Vendor lock-in to Vercel for optimal experience; Route Handlers are not a full-featured backend — a separate service may be needed if complexity grows.

---

### ADR-0002: OpenAI Realtime API for Voice

**Decision:** Use the OpenAI Realtime API as the primary voice interaction engine.

**Key Rationale:** Native voice-to-voice capability, low latency, GPT-4 context management built-in, no custom voice pipeline needed.

**Consequences:** Strong vendor dependency; cost per session; no fallback if OpenAI is unavailable.

---

### ADR-0003: Prisma as Database ORM

**Decision:** Use Prisma as the ORM with PostgreSQL.

**Key Rationale:** Type-safe queries, mature migration tooling, excellent developer experience, TypeScript-native.

**Consequences:** Query overhead vs. raw SQL; connection pool management in development.

---

### ADR-0004: PostgreSQL as Primary Database

**Decision:** Use PostgreSQL (via Supabase) as the primary database.

**Key Rationale:** Relational integrity for user→session→transcript→report; JSONB for transcript flexibility; ACID compliance.

**Consequences:** Operational complexity (even managed requires attention); schema migration planning needed for large tables.

---

### ADR-0005: JWT for Authentication

**Decision:** Use JWT with httpOnly cookies and refresh token rotation.

**Key Rationale:** Stateless API design, no session store needed, simple horizontal scaling, industry standard.

**Consequences:** Token revocation lag (15 min); access tokens are signed not encrypted (no sensitive data stored in them).

---

## 4. How to Add a New Decision

1. Create a new file in `docs/decisions/` with the next sequential number.
2. Use the template: `docs/templates/adr-template.md`.
3. Fill in all sections — context, decision, rationale, consequences.
4. Update this index with the new decision.
5. Link the ADR from the relevant engineering document.

---

## 5. Superseded Decisions

No decisions have been superseded yet.

---

## 6. Deprecated Decisions

No decisions have been deprecated yet.

---

## 7. Related Documents

- [docs/decisions/](../decisions/)
- [docs/templates/adr-template.md](../templates/adr-template.md)
