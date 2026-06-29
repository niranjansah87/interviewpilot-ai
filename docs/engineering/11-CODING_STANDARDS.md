# Coding Standards

**Product:** InterviewPilot AI
**Document:** Coding Standards & Style Guide
**Version:** 1.0
**Status:** Draft
**Owner:** Niranjan Sah

---

## 1. Philosophy

Code is read far more often than it is written. Prioritize clarity, consistency, and explicitness over cleverness. Write code that a new engineer can understand in six months without asking questions.

---

## 2. TypeScript

### General Rules

- **Strict mode is always on.** (`"strict": true` in `tsconfig.json`)
- **No `any` types.** Use `unknown` when the type is genuinely unknown, then narrow it.
- **Explicit return types** on public functions and API route handlers.
- **No non-null assertions (`!`)** unless absolutely certain. Prefer explicit checks.

### Types vs Interfaces

Use `interface` for object shapes that may be extended:
```typescript
interface User {
  id: string;
  email: string;
}
```

Use `type` for unions, intersections, and aliases:
```typescript
type Status = 'idle' | 'listening' | 'processing';
type MaybeUser = User | null;
```

### Naming

| Construct | Convention | Example |
|-----------|-----------|---------|
| Variables | camelCase | `userId`, `isLoading` |
| Functions | camelCase | `getUser()`, `createSession()` |
| Classes | PascalCase | `InterviewSession` |
| Types/Interfaces | PascalCase | `UserProfile`, `InterviewConfig` |
| Constants | UPPER_SNAKE | `MAX_DURATION_SECONDS` |
| Files (components) | PascalCase | `InterviewCard.tsx` |
| Files (utilities) | kebab-case | `api-client.ts` |
| Enums | PascalCase | `enum InterviewType` (prefer string unions instead) |

---

## 3. React / Next.js

### Components

- **Always functional components.** No class components.
- **Explicit prop types** via TypeScript interfaces.
- **Co-locate styles** where possible (CSS modules or Tailwind utility classes).
- **One component per file.** The file name matches the component name.

```typescript
// Good
interface ButtonProps {
  variant: 'primary' | 'secondary';
  onClick: () => void;
  children: React.ReactNode;
}

// Bad — inline types
const Button = ({ variant, onClick, children }: { variant: string; ... }) => ...
```

### Hooks

- Custom hooks live in `src/hooks/`.
- Prefix with `use`: `useInterview`, `useAuth`.
- Return objects from hooks, not arrays (easier to extend without breaking consumers).

### Server Components vs. Client Components

- Default to **Server Components**. Add `'use client'` only when the component uses browser APIs, hooks, or event handlers.
- Keep the client boundary as small as possible.

---

## 4. API Routes (Next.js Route Handlers)

```typescript
// Good — explicit types, async handler, structured errors
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await createInterviewSession(body);
    return Response.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return Response.json(
        { detail: error.message, code: 'VALIDATION_ERROR' },
        { status: 422 }
      );
    }
    throw error; // Let Next.js error handler catch it
  }
}
```

Rules:
- Always `async`.
- Always return `Response` or `NextResponse`.
- Never return plain objects — always `Response.json()`.
- Validate all inputs with Zod before processing.

---

## 5. Git Conventions

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

| Type | When to Use |
|------|------------|
| feat | New feature |
| fix | Bug fix |
| docs | Documentation only |
| refactor | Code change with no feature/fix |
| test | Adding or updating tests |
| chore | Maintenance, dependency updates |
| perf | Performance improvement |

Examples:
```
feat(auth): add JWT refresh token rotation
fix(interview): prevent duplicate transcript entries on reconnect
docs(api): document feedback report schema
```

### Branch Naming

```
feature/description          # new features
bugfix/description           # bug fixes
hotfix/description          # production emergencies
chore/description           # maintenance
docs/description            # documentation only
```

---

## 6. File Organization

```
src/
├── app/                      # Next.js App Router pages and API routes
│   ├── (auth)/              # Auth route group (login, register)
│   ├── (dashboard)/         # Protected dashboard routes
│   └── api/                 # Route handlers
├── components/              # Shared UI components
│   ├── ui/                  # shadcn/ui base components
│   └── features/             # Feature-specific components
├── hooks/                   # Custom React hooks
├── lib/                     # Core utilities
│   ├── api/                 # API client functions
│   ├── auth/                # Auth utilities (JWT, hashing)
│   ├── db/                  # Prisma client
│   └── ai/                  # AI service adapters
├── services/                # Business logic
├── types/                   # Shared TypeScript types
└── __tests__/               # Tests (mirrors src structure)
```

---

## 7. Linting & Formatting

| Tool | Purpose |
|------|---------|
| ESLint | Code quality and style |
| Prettier | Code formatting (runs via ESLint plugin) |
| TypeScript | Type checking (`npm run typecheck`) |

CI enforces both ESLint and TypeScript. Editors should format on save.

---

## 8. Related Documents

- [10-TESTING.md](10-TESTING.md)
- [14-ERROR_HANDLING.md](14-ERROR_HANDLING.md)
- [07-SECURITY.md](07-SECURITY.md)
