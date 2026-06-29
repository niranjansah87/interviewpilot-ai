# Providers

React context providers for application-wide concerns.

## Examples

- `AuthProvider` — authentication state
- `QueryProvider` — React Query client
- `ToastProvider` — notifications

## Rules

- Providers are client components (`'use client'`)
- Wrap the app root in `src/app/layout.tsx`
- Never put business logic in providers — delegate to services
