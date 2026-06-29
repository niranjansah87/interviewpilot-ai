# Stores

Client-side state management using Zustand.

## Rules

- Stores hold only UI state and client-only state — never server data
- Server data flows through React Query / TanStack Query
- One store per domain concern
- Keep stores flat — avoid deeply nested state
- Use slices pattern for large stores

## Naming

```
stores/
├── auth.store.ts
├── interview.store.ts
└── ui.store.ts
```
