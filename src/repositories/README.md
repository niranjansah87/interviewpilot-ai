# Repositories

Data access layer. Repositories abstract all database operations and are the only layer that directly uses Prisma.

## Rules

- Repositories are never called from route handlers — services call repositories
- Each repository manages one domain entity (User, InterviewSession, Transcript, etc.)
- Use Prisma's generated types for database models
- Never return Prisma model instances directly — map to domain types

## Naming

```
repositories/
├── user.repository.ts
├── session.repository.ts
└── transcript.repository.ts
```
