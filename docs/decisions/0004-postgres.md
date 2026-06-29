# ADR-0004: PostgreSQL as Primary Database

**Status:** Accepted
**Date:** 2026-06-21
**Deciders:** Niranjan Sah

---

## Context

InterviewPilot AI stores user accounts, interview sessions, transcripts, and feedback reports. We needed a primary database that provides relational integrity, ACID compliance, and JSON support for semi-structured transcript data.

We evaluated PostgreSQL, MySQL, and MongoDB.

## Decision

**Use PostgreSQL** as the primary database, hosted on Supabase.

## Rationale

### Why PostgreSQL

- **Relational integrity** — Users, sessions, transcripts, and reports have clear foreign-key relationships. PostgreSQL's referential integrity enforcement prevents orphaned records.
- **JSON support** — Transcripts and feedback JSON structures can be stored in `JSONB` columns with index support, giving us schema flexibility without sacrificing queryability.
- **ACID compliance** — Interview sessions and feedback generation require atomic transactions. We need confidence that partial writes cannot occur.
- **PostGIS / Full-text** — Future geolocation features or transcript search are natural extensions.
- **Supabase** — Managed PostgreSQL with built-in auth, edge functions, and a generous free tier. Reduces operational overhead for the MVP.

### Why Not Alternatives

- **MySQL** — Viable alternative, but PostgreSQL's JSONB support and more expressive indexing give it an edge for our transcript use case.
- **MongoDB** — Poor fit. Our data is strongly relational (user → session → transcript → report). MongoDB would require denormalizing relationships that PostgreSQL handles naturally.

## Consequences

### Positive

- Familiar, battle-tested relational database
- JSONB for flexible transcript storage
- Full-text search via `tsvector` if needed
- Supabase provides auth, storage, and managed backups

### Negative

- **Operational complexity** — Even with Supabase, we manage a database server. Connection limits, query performance, and index maintenance require attention.
- **Schema evolution** — Adding columns to large tables requires careful migration planning (pg 11+ online index builds help).

## Notes

- The database schema is defined in `prisma/schema.prisma` and enforced by Prisma Migrate.
- All timestamps are stored in UTC. The application handles timezone conversion.
- Soft deletes are used for user accounts to preserve interview history for compliance.
