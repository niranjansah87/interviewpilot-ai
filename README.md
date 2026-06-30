# InterviewPilot AI

> AI-powered voice interview platform that simulates realistic technical and behavioral interviews through dynamic, adaptive conversations.

InterviewPilot AI lets candidates practice interviews with an AI interviewer using natural voice conversations. Unlike platforms that rely on static question banks, InterviewPilot generates contextual follow-up questions, adapts to candidate responses in real time, and delivers detailed feedback reports with scores, strengths, and improvement suggestions.

---

## Features

### Voice Interviews

Natural voice conversations powered by **ElevenLabs ConvAI** — the primary voice provider. Features real-time audio visualization using Web Audio API, local Voice Activity Detection (VAD), and instant barge-in support. OpenAI Realtime API available as fallback.

### Adaptive Conversation Engine

A deterministic state machine orchestrates every interview. The AI interviewer adapts based on:

- Candidate responses and experience level
- Interview type (Behavioral, Technical, System Design, Frontend, Backend, Full-Stack, DevOps)
- Resume data and job descriptions (when provided)
- Full conversation history with context compression for long sessions

### AI Feedback Reports

After every completed interview:

- Overall score (0–100) plus breakdowns: Communication, Confidence, Technical Reasoning
- Strengths and weaknesses with specific examples from the transcript
- Actionable improvement suggestions
- Full searchable transcript

### Authentication & Security

- JWT access tokens (15 min) + refresh tokens (7 days) in httpOnly cookies
- bcrypt password hashing (cost factor 12)
- CSRF double-submit cookie protection
- SHA-256 hashed refresh tokens with rotation and reuse detection
- Rate limiting on auth and AI endpoints

### Infrastructure

- **PostgreSQL** via Prisma ORM with migrations and seed data
- **Redis** caching with automatic memory fallback
- **Startup health checks** for Database, Redis, OpenAI, and ElevenLabs
- Structured JSON logging via Pino

---

## Tech Stack

| Layer      | Technology                              |
| ---------- | --------------------------------------- |
| Framework  | Next.js 16, React 19, TypeScript        |
| Styling    | TailwindCSS, shadcn/ui, Framer Motion   |
| State      | TanStack React Query, Zustand           |
| Backend    | Next.js Route Handlers (API routes)     |
| ORM        | Prisma 6                                |
| Database   | PostgreSQL (Supabase)                   |
| Cache      | Redis (ioredis) with in-memory fallback |
| AI Voice   | ElevenLabs ConvAI, OpenAI Realtime (fallback) |
| AI Text    | GPT-4 / GPT-4.1 (feedback generation)   |
| Auth       | JWT (jose), bcrypt, SHA-256             |
| Validation | Zod v4                                  |
| Logging    | Pino v10                                |
| Testing    | Vitest, Playwright                      |
| Deployment | Vercel                                  |

---

## Architecture

```
Browser (MediaRecorder / Web Audio)
   │
   ▼
Next.js 16 (App Router)
   │
   ├── proxy.ts (security headers, auth redirects)
   ├── Route Handlers (/api/v1/*)
   ├── Service Layer (auth, interview)
   ├── Repository Layer (user, interview, refresh-token)
   ├── Prisma ORM → PostgreSQL (Supabase)
   │
   ├── AI Provider Abstraction
   │   ├── ElevenLabs ConvAI adapter (WebSocket, STT + TTS)
   │   └── OpenAI adapter (feedback generation, fallback)
   │
   ├── Conversation Engine
   │   ├── State machine (7 states, 9 events)
   │   ├── Context engine (profile, resume, JD, history)
   │   ├── Prompt engine (modular, 8 role-specific templates)
   │   └── Token manager (100k budget per session)
   │
   ├── Cache Layer
   │   ├── RedisCache (production)
   │   └── MemoryCache (development / fallback)
   │
   └── Monitoring
       ├── Pino structured logger
       └── Startup infrastructure health checks
```

See [docs/engineering/01-ARCHITECTURE.md](docs/engineering/01-ARCHITECTURE.md) for the full architecture.

---

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Login, register
│   ├── (dashboard)/              # Protected dashboard routes
│   │   └── dashboard/
│   │       ├── page.tsx          # Dashboard home
│   │       ├── interviews/       # History, new, detail
│   │       ├── profile/          # User profile + password
│   │       └── settings/         # Theme + preferences
│   └── api/v1/                   # REST API route handlers
│       ├── auth/                 # register, login, logout, refresh
│       ├── users/me/             # profile, name, password
│       ├── interviews/           # CRUD + transcript + report
│       └── health/               # Public health endpoint
├── components/
│   ├── ui/                      # shadcn/ui base components
│   └── features/                # Header, Sidebar, VoiceInterface
├── hooks/                        # useInterviewSession
├── lib/
│   ├── ai/                      # Provider interface + adapters (ElevenLabs, OpenAI)
│   ├── auth/                    # JWT, bcrypt, cookies, CSRF, session
│   ├── conversation/            # Engine, context, prompts, token manager
│   ├── api/                     # Route helpers, rate limiting, session extraction
│   ├── errors.ts                # 9-class error hierarchy
│   ├── startup-health.ts        # Infrastructure health checks
│   └── ...                      # cn, time, request-id, audio/runtime
├── services/                     # Auth + interview business logic
├── repositories/                 # Prisma data access (user, interview, refresh-token)
├── cache/                        # CacheProvider interface, Redis + Memory implementations
├── config/                       # Zod-validated environment
├── constants/                    # Routes, cookies, limits, roles, headers
├── types/                        # Shared TypeScript types
├── validators/                   # Zod validation schemas
├── monitoring/                   # Pino logger
├── providers/                    # Theme, Query, Toast
├── features/                     # Feature module placeholders
├── database/                     # Prisma client singleton
├── proxy.ts                      # Security headers + auth redirects
├── instrumentation.ts            # Startup health check hook
└── styles/                       # globals.css with design tokens
```

---

## Getting Started

```bash
# Clone
git clone https://github.com/niranjansah87/interviewpilot-ai.git
cd interviewpilot-ai

# Install dependencies
pnpm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your values

# Run database migrations
pnpm prisma migrate dev

# Seed development data
pnpm prisma db seed

# Start development server
pnpm dev
```

### Required Environment Variables

| Variable                | Description                                     |
| ----------------------- | ----------------------------------------------- |
| `DATABASE_URL`          | PostgreSQL connection string                    |
| `JWT_SECRET`            | Access token signing secret (min 32 chars)      |
| `JWT_REFRESH_SECRET`    | Refresh token signing secret (min 32 chars)     |
| `OPENAI_API_KEY`        | OpenAI API key                                  |
| `OPENAI_REALTIME_MODEL` | Realtime model (e.g. `gpt-4o-realtime-preview`) |
| `NEXT_PUBLIC_APP_URL`   | Application URL                                 |

### Optional

| Variable             | Default      | Description                            |
| -------------------- | ------------ | -------------------------------------- |
| `CACHE_PROVIDER`     | `memory`     | Set to `redis` to enable Redis caching |
| `REDIS_URL`          | —            | Redis connection string                |
| `ELEVENLABS_API_KEY` | —            | ElevenLabs voice API key               |
| `VOICE_PROVIDER`     | `elevenlabs` | `elevenlabs` / `openai` / `mock`       |
| `LOG_LEVEL`          | `info`       | Pino log level                         |
| `SENTRY_DSN`         | —            | Sentry error tracking                  |

---

## API Endpoints

| Method   | Route                                | Auth     | Status     |
| -------- | ------------------------------------ | -------- | ---------- |
| `GET`    | `/api/v1/health`                     | Public   | ✅         |
| `POST`   | `/api/v1/auth/register`              | Public   | ✅         |
| `POST`   | `/api/v1/auth/login`                 | Public   | ✅         |
| `POST`   | `/api/v1/auth/logout`                | Public   | ✅         |
| `POST`   | `/api/v1/auth/refresh`               | Public   | ✅         |
| `GET`    | `/api/v1/users/me`                   | Required | ✅         |
| `PATCH`  | `/api/v1/users/me/name`              | Required | ✅         |
| `POST`   | `/api/v1/users/me/password`          | Required | ✅         |
| `POST`   | `/api/v1/interviews`                 | Required | ✅         |
| `GET`    | `/api/v1/interviews`                 | Required | ✅         |
| `GET`    | `/api/v1/interviews/[id]`            | Required | ✅         |
| `DELETE` | `/api/v1/interviews/[id]`            | Required | ✅         |
| `GET`    | `/api/v1/interviews/[id]/transcript` | Required | 🚧 Phase 3 |
| `GET`    | `/api/v1/interviews/[id]/report`     | Required | 🚧 Phase 3 |

---

## Interview Flow

```
Login → Configure (type, role, level) → AI introduces → Voice conversation
                                                              ↓
                                              Real-time transcription
                                              Dynamic follow-up questions
                                              Context compression
                                                              ↓
                                                      End session
                                                              ↓
                                                  Transcript saved
                                                              ↓
                                              GPT-4 feedback generated
                                                              ↓
                                              Report on Dashboard
```

---

## Documentation

| Section                                | Contents                                                                |
| -------------------------------------- | ----------------------------------------------------------------------- |
| [docs/product/](docs/product/)         | Product definition, personas, requirements, roadmap                     |
| [docs/engineering/](docs/engineering/) | Architecture, tech stack, AI engine, API, database, caching, deployment |
| [docs/decisions/](docs/decisions/)     | Architecture Decision Records (5 ADRs)                                  |
| [docs/runbooks/](docs/runbooks/)       | Database migrations, incident response                                  |
| [docs/templates/](docs/templates/)     | ADR, runbook, research, postmortem, feature spec templates              |

---

## Roadmap

### ✅ Phase 1 — Foundation

Project scaffolding, documentation, CI/CD, ADRs.

### ✅ Phase 2 — Core Architecture

Authentication, database schema, UI components, caching, error handling, API routes, proxy middleware.

### 🚧 Phase 3 — AI Interview Engine (In Progress)

Voice conversation via ElevenLabs ConvAI, audio runtime with real VAD, barge-in support, state machine, prompt library, context engine, transcript storage.

### ✅ Phase 4 — Feedback System

GPT-4 feedback reports, transcript viewer, score visualizations.

### ✅ Phase 5 — Production Readiness

Rate limiting, CSRF, Redis caching, security hardening.

### ⬜ Future

Resume-aware interviews, coding workspace, system design, multiple personas, recruiter dashboard.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) and [docs/engineering/11-CODING_STANDARDS.md](docs/engineering/11-CODING_STANDARDS.md).

## Security

Report vulnerabilities privately — see [SECURITY.md](SECURITY.md).

## License

MIT. See [LICENSE.md](LICENSE.md).
