# Jobs

Background job processing (placeholder for future).

## When to Use

- Token usage reporting
- Email notifications
- Scheduled report generation
- Cleanup tasks (orphaned sessions, expired data)

## Rules

- Background jobs are triggered by events, not called directly
- Use a queue system (e.g., Inngest, Trigger.dev, or BullMQ) when complexity warrants it
- Keep job handlers in `jobs/` with one file per job

## Placeholder

Jobs infrastructure is not implemented in Phase 1.
