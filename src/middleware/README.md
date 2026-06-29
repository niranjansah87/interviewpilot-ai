# Middleware

Next.js middleware for request-level processing.

## Responsibilities

- JWT verification on protected routes
- Redirect unauthenticated users to login
- Add request ID headers
- CORS handling (prefer Route Handler config over middleware when possible)

## Rules

- Middleware runs on every request — keep it fast
- Never do heavy computation in middleware
- Import from `lib/` carefully — avoid circular dependencies
- Use Edge Runtime when possible

## File Location

Next.js middleware is always at `src/middleware.ts` (project root), importing logic from `src/middleware/` as needed.
