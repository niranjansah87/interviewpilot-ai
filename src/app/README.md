# App

Next.js App Router pages and route handlers.

## Structure

```
app/
├── (auth)/           # Auth route group — no shell layout
├── (dashboard)/      # Protected routes — shell layout
└── api/             # Route handlers
    └── v1/          # API version 1
```

## Rules

- Route handlers never contain business logic — delegate to services
- Use `Route Handler` files (`route.ts`) for API endpoints
- Use `page.tsx` files for pages
- Use `layout.tsx` files for shared layouts
- Route groups `(auth)` and `(dashboard)` don't affect the URL
