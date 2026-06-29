# ADR-0001: Next.js as Frontend Framework

**Status:** Accepted
**Date:** 2026-06-21
**Deciders:** Niranjan Sah

---

## Context

We needed to select a frontend framework for InterviewPilot AI. The frontend is responsible for the user interface, voice capture via WebRTC, real-time audio streaming, interview configuration, and feedback visualization.

We evaluated Next.js, Remix, and a plain Vite + React SPA.

## Decision

**Use Next.js 15** with the App Router, React Server Components, and Route Handlers as the API layer.

## Rationale

### Why Next.js

- **Server Components** — Reduce client-side JavaScript for improved initial load. Interview reports and dashboards benefit from server-rendered content.
- **Route Handlers** — Provide a clean API layer without needing a separate backend service for the MVP. Reduces deployment complexity.
- **Streaming** — Built-in support for React Suspense and streaming responses, which pairs well with the AI's streaming audio.
- **Deployment** — Vercel's zero-config deployment aligns with our infrastructure choices.
- **Ecosystem** — React 19, TypeScript, and the broader Next.js ecosystem are well-understood by the team.

### Why Not Alternatives

- **Remix** — Excellent framework, but Vercel's Next.js optimization and our team's familiarity with Next.js made it the pragmatic choice.
- **Plain Vite SPA** — Would require managing a separate API server from day one. The App Router API routes provide sufficient backend capability for the MVP scope.

## Consequences

### Positive

- Single deployment unit for frontend + lightweight API
- Improved initial page performance via Server Components
- Simplified CI/CD pipeline
- Strong TypeScript and React 19 support

### Negative

- Vendor lock-in to Vercel for optimal experience (though deployable elsewhere)
- Next.js specific conventions increase onboarding for developers unfamiliar with the framework
- Route Handlers are not a full-featured backend — will need a separate service if complexity grows significantly

## Notes

- The Route Handler pattern was chosen deliberately over a separate Express/FastAPI backend to minimize operational complexity for the MVP.
- If backend complexity requires a dedicated service (separate database, background workers, etc.), a FastAPI service will be introduced. The frontend architecture is already designed to consume external APIs.
