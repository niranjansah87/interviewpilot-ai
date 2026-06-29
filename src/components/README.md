# Components

Shared UI components and feature-specific components.

## Structure

```
components/
├── ui/              # shadcn/ui base components
└── features/       # Feature-scoped components (prefer co-locating in features/ instead)
```

## Rules

- Prefer placing feature components inside `features/<name>/components/`
- `components/ui/` holds only generic, reusable primitives
- One component per file; filename matches component name
- Components are Server Components by default; add `'use client'` only when needed
