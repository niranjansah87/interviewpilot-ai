# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Phase 3 — AI Interview Engine (In Progress)

#### Added
- AI Provider abstraction layer (`src/lib/ai/provider.ts`) with runtime registry
- OpenAI Realtime API adapter (WebSocket voice + GPT-4.1 feedback)
- ElevenLabs ConvAI adapter (WebSocket voice conversation)
- ElevenLabs TTS adapter (text-to-speech)
- Voice provider fallback chain: elevenlabs → openai → mock
- Conversation engine with 7-state machine (`src/lib/conversation/engine.ts`)
- Context engine with resume, job description, and history support
- Prompt engine with modular block composition (`src/lib/conversation/prompt-engine.ts`)
- 8 role-specific system prompts (behavioral, technical, frontend, backend, fullstack, devops, system-design, feedback)
- Token manager with 100k budget per session and cost estimation
- `VoiceInterface` component with real-time transcription panel
- `useInterviewSession` hook with full lifecycle (start, speak, listen, end, demo mode)
- `Header` and `Sidebar` dashboard components with collapsible layout
- Rate limiting on auth and API routes (`src/lib/api/rate-limit.ts`)

### Phase 2 — Core Architecture

#### Added
- Next.js 16 App Router with (auth) and (dashboard) route groups
- 14 API endpoints: auth (5), users (3), interviews (5), health (1)
- JWT authentication with jose — access (15 min) + refresh (7 days) tokens
- bcrypt password hashing (cost factor 12)
- SHA-256 refresh token hashing with revocation support
- CSRF double-submit cookie protection (AES-256-GCM)
- httpOnly cookie helpers for access, refresh, and CSRF tokens
- Prisma schema with 5 models: User, InterviewSession, TranscriptEntry, FeedbackReport, RefreshToken
- Repository layer: user, interview, refresh-token with Redis cache-aside
- Service layer: auth (register, login, refresh, logout), interview (CRUD)
- 9-class error hierarchy: ApplicationError through RateLimitError
- API route helpers: `apiSuccess()`, `apiError()`, `apiEmpty()`
- Standardized API response envelope with request IDs
- CacheProvider interface with MemoryCache (LRU) and RedisCache implementations
- Redis cache with automatic memory fallback on connection failure
- SCAN-based pattern deletion for cache invalidation
- Type-safe cache key factory (`src/cache/cache-keys.ts`)
- Zod v4 environment validation (20+ variables)
- Pino v10 structured logger with pretty-print in development
- Startup infrastructure health checks (PostgreSQL, Redis, OpenAI, ElevenLabs)
- Next.js instrumentation hook for health checks on server boot
- 10 shadcn/ui components: Button, Card, Input, Label, Badge, Separator, Skeleton, Sonner, Tooltip
- ThemeProvider (dark/light/system), QueryProvider (TanStack React Query), ToastProvider (Sonner)
- Landing page with hero, features, CTA, and JSON-LD structured data
- Dashboard home, interview history, interview detail, profile, and settings pages
- Login and registration pages with form validation
- 404, error, and loading page states
- Proxy middleware: security headers, HTTP→HTTPS redirect, auth redirects
- Prisma seed data: 2 users, 4 interview sessions, 10 transcript entries, 2 feedback reports
- Zod validation schemas: email, password, name, pagination, UUID
- Shared TypeScript types: auth, database models, API contracts
- Constants: routes, cookies, limits, roles, headers
- Time utilities: Duration class, UTC helpers, timestamp formatting
- Request/trace ID generation via `node:crypto`
- Engineering docs: caching strategy (ADM), updated architecture, API spec

#### Changed
- ESLint config simplified (removed perfectionist plugin)
- tsconfig adjusted for Turbopack path resolution
- globals.css rewritten with shadcn/ui design tokens (light + dark)
- `middleware.ts` renamed to `proxy.ts` per Next.js 16 conventions
- Separator and Tooltip components simplified (no Radix dependency)

#### Fixed
- Zod v4 API migration (`.errors` → `.issues`, `.startsWith()` → `.min()`)
- JWT type naming (jwtPayload → TokenPayload)
- Duration `.toMillis` getter access
- `noImplicitOverride` errors on error class `toJSON()` methods
- Cache provider type safety for `getOrSet` parameters

### Phase 1 — Foundation

#### Added
- Project scaffolding with Next.js, TypeScript, TailwindCSS
- Full documentation structure: product/, engineering/, decisions/, runbooks/, templates/
- 5 Architecture Decision Records (ADRs)
- Mermaid diagrams: authentication, deployment, interview engine, voice flow
- GitHub CI/CD workflows, issue templates, PR template
- Community files: CODEOWNERS, CODE_OF_CONDUCT, SUPPORT, SECURITY
- Product requirements, personas, user journeys, functional requirements
- MVP scope definition, roadmap, release plan
