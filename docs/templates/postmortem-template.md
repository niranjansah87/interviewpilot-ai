# Postmortem: [Short Incident Title]

**Date:** YYYY-MM-DD
**Duration:** X hours Y minutes
**Severity:** SEV1 | SEV2 | SEV3
**Author:** Name
**Review Date:** YYYY-MM-DD

---

## Summary

One paragraph: what happened, what the user impact was, and what the resolution was.

---

## Impact

| Metric | Value |
|--------|-------|
| Duration | X minutes/hours |
| Users affected | ~N |
| Revenue impact (if applicable) | $X |
| Failed transactions | N |

---

## Timeline (all times UTC)

| Time | Event |
|------|-------|
| HH:MM | Alert received |
| HH:MM | Engineer acknowledged |
| HH:MM | Root cause identified |
| HH:MM | Mitigation applied |
| HH:MM | Service restored |
| HH:MM | Postmortem published |

---

## Root Cause

What was the underlying cause of the incident?

---

## Contributing Factors

What conditions made this incident possible or worse?

---

## What Went Well

What worked during the response?

---

## What Went Poorly

What slowed down the response?

---

## Action Items

| Action | Owner | Due Date | Status |
|--------|-------|----------|--------|
| Fix X to prevent recurrence | @name | YYYY-MM-DD | Open |
| Add alerting for Y | @name | YYYY-MM-DD | Open |

---

## Lessons Learned

What did we learn from this incident?

---

## Related

- Incident channel: #incidents-YYYY-MM-DD
- Sentry issue: [link]
- Deploy rollback: [commit hash]
