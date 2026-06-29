# Database

Database-related modules.

## Structure

```
database/
├── prisma.ts      # Prisma client singleton
└── migrations/    # Prisma migration files
```

The Prisma client singleton is the only database connection manager. All other database access goes through repositories.

## Rules

- Never create additional Prisma client instances
- Use `prisma.$connect()` / `prisma.$disconnect()` in serverless entrypoints
- Keep heavy queries out of hot paths
