# Scripts

Operational and development scripts.

## Scripts

| Script | Purpose |
|--------|---------|
| `bootstrap.ts` | Initial project setup and dependency verification |
| `verify-env.ts` | Validate environment variables against Zod schema |
| `cleanup.ts` | Remove build artifacts, caches, and generated files |
| `healthcheck.ts` | Verify database, AI provider, and external services are reachable |
| `generate-types.ts` | Generate TypeScript types from Prisma schema |

## Rules

- Scripts are plain TypeScript — run with `tsx` or compiled
- Scripts must be executable and have proper error handling
- Document each script's purpose and usage in this README
