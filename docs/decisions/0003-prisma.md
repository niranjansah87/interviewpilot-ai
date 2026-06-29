# ADR-0003: Prisma as Database ORM

**Status:** Accepted
**Date:** 2026-06-21
**Deciders:** Niranjan Sah

---

## Context

InterviewPilot AI uses PostgreSQL as its primary database. We needed an ORM that provides type-safe queries, reliable migrations, and a pleasant developer experience without adding unnecessary overhead.

We evaluated Prisma, Drizzle, and raw SQLAlchemy 2.0 (async).

## Decision

**Use Prisma** as the ORM with PostgreSQL.

## Rationale

### Why Prisma

- **Type-safe queries** — Prisma's generated types are a significant improvement over string-based queries. The schema is the source of truth, and TypeScript types are derived automatically.
- **Migration system** — Prisma Migrate provides a clean, declarative migration workflow. Migration history is version-controlled and reproducible.
- **Developer experience** — The Prisma schema language is intuitive. The Studio GUI is useful for debugging during development.
- **N+1 prevention** — Built-in include/findMany patterns reduce common query performance issues.
- **Next.js compatibility** — Prisma integrates well with Next.js Server Components and Route Handlers via the prisma/adapter-\[runtime\] packages.

### Why Not Alternatives

- **Drizzle** — Drizzle is compelling and lightweight, but Prisma's migration tooling and schema management are more mature for a team at this stage. Drizzle is a strong future consideration if migration complexity becomes a bottleneck.
- **SQLAlchemy 2.0 async** — Excellent ORM, but Python-only. Our stack is TypeScript end-to-end, so a TypeScript-native ORM reduces cognitive overhead.

## Consequences

### Positive

- Type-safe database access throughout the stack
- Clean migration workflow
- Excellent debugging tooling (Prisma Studio)
- Active community and ecosystem

### Negative

- **Performance** — Prisma's query engine adds overhead compared to raw SQL or Knex. For the MVP's scale, this is acceptable. If performance becomes critical at scale, raw queries or Drizzle are viable alternatives.
- **Prisma Client singleton** — Requires careful management in Next.js development mode to avoid connection pool issues.
- **Limited raw query flexibility** — Complex queries sometimes require workarounds or raw SQL.

## Notes

- Connection pooling is managed via PgBouncer in production and Prisma's built-in pool in development.
- The Prisma schema is located at `prisma/schema.prisma` and is the authoritative source for the database schema.
- If the project requires significant custom SQL, raw queries via `prisma.$queryRaw` are acceptable.
