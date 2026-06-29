# Lib

Core utilities and library code shared across the application.

## Structure

```
lib/
├── api/           # API client, fetch wrapper
├── auth/          # JWT, password hashing, session
├── db/            # Prisma client singleton
├── ai/            # AI provider adapters
├── validators/    # Zod schemas
└── utils/        # General utilities (cn, format, etc.)
```

## Rules

- `lib/` is for infrastructure and low-level utilities — not business logic
- `lib/db/prisma.ts` is the only place that instantiates the Prisma client
- No React components in `lib/`
- Utility functions are tree-shakeable (no side effects at module level)
