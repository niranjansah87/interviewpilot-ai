# Contributing to InterviewPilot AI

Thanks for contributing. This guide covers how to set up the project, make changes, and submit them.

## Code of Conduct

Be respectful. Assume good intent. Constructive feedback only.

## Getting Started

```bash
git clone https://github.com/NiranjanDevX/interviewpilot-ai.git
cd interviewpilot-ai
pnpm install
cp .env.example .env.local   # fill in your values
pnpm prisma migrate dev
pnpm prisma db seed
pnpm dev                      # http://localhost:3000
```

### Required environment variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Access token signing secret (min 32 chars) |
| `JWT_REFRESH_SECRET` | Refresh token signing secret (min 32 chars) |
| `OPENAI_API_KEY` | OpenAI API key |
| `OPENAI_REALTIME_MODEL` | Realtime model name |
| `NEXT_PUBLIC_APP_URL` | Application URL |

Optional: `REDIS_URL`, `CACHE_PROVIDER`, `ELEVENLABS_API_KEY`, `VOICE_PROVIDER`, `SENTRY_DSN`.

## Development Workflow

### Before writing code

1. Read the relevant engineering doc in `docs/engineering/`
2. Check `docs/decisions/` for prior architectural decisions
3. For new architectural decisions, create an ADR using `docs/templates/adr-template.md`

### Branch naming

```
feature/description    — new features
bugfix/description     — bug fixes
hotfix/description     — urgent production fixes
docs/description       — documentation-only changes
refactor/description   — code restructuring
```

### Commits

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(scope): description
fix(scope): description
docs(scope): description
refactor(scope): description
chore(scope): description
```

### Before committing

```bash
pnpm typecheck     # TypeScript strict mode — must pass
pnpm lint          # ESLint — must pass
pnpm test          # Vitest — must pass
```

## Code Standards

See `docs/engineering/11-CODING_STANDARDS.md` for the full guide. Key points:

### TypeScript
- Strict mode always on — no `any`
- Explicit return types on public functions
- `interface` for object shapes, `type` for unions and aliases
- `PascalCase` for components and types, `camelCase` for variables and functions

### React / Next.js
- Functional components only — no classes
- Server Components by default — `'use client'` only when needed
- One component per file — filename matches component name
- Explicit prop types via TypeScript interface

### API Routes
- Always `async`, always return `Response.json()`
- Validate all inputs with Zod before processing
- Use `ApplicationError` subclasses for known errors — throw for unexpected ones
- Delegate business logic to services — never put it in route handlers
- Use repository functions for data access — never access Prisma directly from services

### Logging
- Use Pino (`import { logger } from '@/monitoring/logger'`)
- Never use `console.log` in application code

## Project Structure

```
src/
├── app/api/v1/       # Route handlers — thin, delegates to services
├── services/          # Business logic
├── repositories/      # Data access via Prisma
├── lib/ai/            # AI provider abstraction + adapters
├── lib/auth/          # JWT, bcrypt, cookies, CSRF
├── lib/conversation/  # Engine, context, prompts, token manager
├── lib/errors.ts      # Error hierarchy
├── cache/             # CacheProvider interface + implementations
├── components/ui/     # Base UI components (shadcn-style)
├── components/features/ # Feature-scoped components
├── hooks/             # Custom React hooks
└── config/            # Zod-validated environment
```

## Pull Requests

1. Create a feature branch from `main`
2. Make your changes — keep commits focused and atomic
3. Ensure CI passes: typecheck + lint + test + build
4. Fill in the PR template from `.github/PULL_REQUEST_TEMPLATE.md`
5. Request review

### PR guidelines

- Keep PRs small — under 400 lines changed is ideal
- One concern per PR — don't mix features with refactors
- Update or add tests for changed behavior
- Update documentation if public APIs or architecture change
- Reference related issues and ADRs in the description

## Testing

```bash
pnpm test              # Unit + integration tests (Vitest)
pnpm test -- --ui      # Vitest UI
pnpm test:e2e          # E2E tests (Playwright)
```

- Unit tests for services, utilities, and hooks
- Integration tests for API routes against a test database
- E2E tests for critical user journeys

## Documentation

- Architecture changes require an ADR in `docs/decisions/`
- New features should update the relevant engineering doc
- API changes must update `docs/engineering/05-API.md`
- Database schema changes must update `docs/engineering/05-DATABASE_ARCHITECTURE.md`

## Questions?

Start with the docs in `docs/engineering/`. For architecture questions, check `docs/decisions/`. For product questions, see `docs/product/`.
