# Runbooks

Operational procedures for running and maintaining InterviewPilot AI in production and staging environments.

> **These documents are internal.** They guide engineers during incidents, deployments, and routine operations. They are not user-facing.

---

## Available Runbooks

| Runbook | Description |
|---------|-------------|
| `database-migrations.md` | How to run and rollback Prisma migrations |
| `deployment.md` | Step-by-step production deployment procedure |
| `incident-response.md` | How to respond to production incidents |
| `ai-service-health.md` | Checking OpenAI API health and quotas |
| `backup-recovery.md` | Database backup and recovery procedures |

---

## When to Use These

- **Before a deployment** — Review the deployment runbook
- **During an incident** — Open the incident response runbook
- **After an incident** — Fill out the postmortem template
- **Adding a migration** — Follow the database migrations guide

---

## Runbook Format

Each runbook follows this structure:

```markdown
# Runbook Title

## Overview
What this runbook covers.

## Prerequisites
What you need before starting.

## Procedure
Step-by-step instructions.

## Verification
How to confirm the operation succeeded.

## Rollback
How to undo if something goes wrong.

## Contacts
Who to notify if issues arise.
```

---

## Template

See `docs/templates/runbook-template.md` for a blank runbook format.
