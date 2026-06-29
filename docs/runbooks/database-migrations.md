# Database Migrations

**Audience:** Engineers running schema changes in staging or production.

---

## Overview

InterviewPilot AI uses [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)
to manage database schema changes. All migrations are stored in `prisma/migrations/`.

---

## Golden Rules

1. **Never** run `prisma migrate dev` in production or staging.
2. **Always** test migrations locally first.
3. **Never** modify the `prisma/migrations/` folder after a migration has been applied to staging or production.
4. **Always** take a database snapshot before applying migrations in staging.

---

## Local Development

```bash
# Make schema changes in prisma/schema.prisma
$ npx prisma migrate dev --name describe-your-change

# Review the generated SQL in prisma/migrations/<timestamp>_describe-your-change/
```

---

## Staging Deployment

```bash
# Connect to staging
$ prisma migrate deploy
```

Checklist before running:
- [ ] Migration reviewed and approved
- [ ] Database snapshot taken
- [ ] Downtime window communicated
- [ ] Rollback plan confirmed

---

## Production Deployment

```bash
# Production migrations run as part of the deployment pipeline
# The CI/CD workflow runs: prisma migrate deploy

# To run manually (emergency only):
$ prisma migrate deploy
```

---

## Rolling Back

### Option 1: Forward migration (preferred)

Instead of rolling back, write a new migration that fixes the issue.

```bash
$ npx prisma migrate dev --name fix-the-issue
```

### Option 2: Database restore

Restore from the pre-migration snapshot taken before the migration.

---

## Verifying a Migration

```bash
# Check migration status
$ npx prisma migrate status

# Check tables match schema
$ npx prisma db pull --force  # pulls schema from DB → verify it matches prisma/schema.prisma
```

---

## Troubleshooting

| Error | Solution |
|-------|----------|
| `Migration table already exists` | Run `prisma migrate resolve --rolled-back <migration-name>` |
| `Database schema out of sync` | Run `prisma migrate reset` (local only, destructive) |
| `Connection refused` | Verify `DATABASE_URL` in `.env` |
