# Folder Structure

**Product:** InterviewPilot AI
**Document:** Project Folder Structure
**Version:** 1.0
**Status:** Draft
**Owner:** Niranjan Sah

---

## 1. Overview

InterviewPilot AI uses a feature-based folder structure that groups related code together. This document describes the canonical folder layout and the reasoning behind each choice.

---

## 2. Root Layout

```
interviewpilot-ai/
├── src/                         # Application source code
├── prisma/                      # Database schema and migrations
├── public/                      # Static assets (favicon, og images)
├── tests/                       # E2E and integration tests
├── docs/                        # Project documentation
├── .github/                     # GitHub config (templates, workflows)
├── .claude/                     # Claude Code configuration
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── .env.example
└── .env.local
```

---

## 3. `src/` Layout

```
src/
├── app/                         # Next.js App Router
│   ├── (auth)/                  # Auth route group (no sidebar)
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (dashboard)/             # Protected routes (with sidebar)
│   │   ├── layout.tsx           # Dashboard shell (sidebar + header)
│   │   ├── page.tsx             # Dashboard home
│   │   ├── interviews/
│   │   │   ├── page.tsx         # Interview list
│   │   │   └── [id]/
│   │   │       ├── page.tsx     # Interview session
│   │   │       └── report/
│   │   │           └── page.tsx # Feedback report
│   │   └── settings/
│   │       └── page.tsx
│   └── api/                     # Route handlers
│       ├── auth/
│       │   ├── register/route.ts
│       │   ├── login/route.ts
│       │   ├── logout/route.ts
│       │   └── refresh/route.ts
│       ├── users/
│       │   └── me/route.ts
│       └── interviews/
│           ├── route.ts          # POST + GET list
│           └── [id]/
│               ├── route.ts      # GET, PATCH, DELETE single
│               ├── transcript/route.ts
│               └── report/route.ts
│
├── components/
│   ├── ui/                      # shadcn/ui base components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   └── features/                 # Feature components
│       ├── auth/
│       │   ├── login-form.tsx
│       │   └── register-form.tsx
│       ├── dashboard/
│       │   ├── interview-card.tsx
│       │   └── stats-grid.tsx
│       ├── interview/
│       │   ├── voice-interface.tsx
│       │   ├── transcript-panel.tsx
│       │   └── interview-setup.tsx
│       └── feedback/
│           ├── score-card.tsx
│           └── report-detail.tsx
│
├── hooks/                        # Shared custom hooks
│   ├── use-auth.ts
│   ├── use-interview.ts
│   └── use-query-utils.ts
│
├── lib/
│   ├── api/                      # API client functions
│   │   ├── client.ts             # Fetch wrapper
│   │   ├── auth.ts               # Auth API calls
│   │   └── interviews.ts         # Interview API calls
│   ├── auth/                     # Auth utilities
│   │   ├── jwt.ts                # JWT sign/verify
│   │   └── password.ts           # bcrypt utilities
│   ├── db/                       # Database
│   │   ├── prisma.ts             # Prisma client singleton
│   │   └── schema.prisma         # (actually in /prisma/)
│   ├── ai/                       # AI service adapters
│   │   ├── provider.ts           # AI provider interface
│   │   └── openai.ts             # OpenAI implementation
│   └── utils/                    # General utilities
│       ├── cn.ts                 # classname merger (clsx + tailwind-merge)
│       └── format.ts              # Date, duration formatters
│
├── services/                     # Business logic layer
│   ├── auth.service.ts
│   ├── interview.service.ts
│   └── feedback.service.ts
│
└── types/                         # Shared TypeScript types
    ├── auth.ts
    ├── interview.ts
    └── api.ts
```

---

## 4. Key Principles

### Colocation

Related code lives together. A component, its types, and its tests are in the same folder, not spread across `components/`, `types/`, and `tests/`.

### Separation of Concerns

| Layer | Responsibility | Never does |
|-------|---------------|-----------|
| `app/` | HTTP routing, auth middleware | Business logic |
| `services/` | Business logic, orchestration | Direct database access |
| `lib/db/` | Database access | Business logic |
| `components/` | Rendering, UI state | Direct DB access, JWT operations |

### Route Groups

`(auth)` and `(dashboard)` are route groups in Next.js App Router. They share a layout but do not create URL segments. `(auth)/login` is just `/login`.

---

## 5. `prisma/` Layout

```
prisma/
├── schema.prisma               # Database schema (source of truth)
├── migrations/                 # Migration history (auto-generated)
│   └── ...timestamp...
├── seed.ts                    # Database seeding
└── __tests__/
    └── schema.test.ts         # Schema validation tests
```

---

## 6. Testing Layout

Tests live next to the code they test:

```
src/lib/auth/jwt.ts
src/lib/auth/jwt.test.ts       # Unit test
src/app/api/auth/login/route.ts
src/app/api/auth/login/route.integration.test.ts
src/components/features/interview/voice-interface.tsx
src/components/features/interview/voice-interface.test.tsx
```

---

## 7. Static Assets

```
public/
├── favicon.ico
├── og-image.png               # Open Graph social image
└── icons/                    # App icons
```

Images are served from `public/` or via `next/image` with `remotePatterns` configured for Supabase Storage if needed.

---

## 8. Documentation Layout

```
docs/
├── README.md                  # This file — master index
├── product/                   # Product definition
├── engineering/               # Technical documentation
├── decisions/                 # Architecture Decision Records
├── runbooks/                  # Operational procedures
├── research/                  # Exploratory research
├── templates/                 # Document templates
└── assets/                    # Diagrams, mockups (gitignored assets)
```

---

## 9. Related Documents

- [11-CODING_STANDARDS.md](11-CODING_STANDARDS.md)
- [03-DATABASE.md](03-DATABASE.md)
- [docs/README.md](../README.md)
