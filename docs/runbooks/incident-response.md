# Incident Response

**Audience:** Any engineer responding to a production incident.

---

## Severity Levels

| Level | Definition | Response Time | Example |
|-------|-----------|-------------|---------|
| **SEV1** | Full outage, data loss, security breach | 15 minutes | API down, database unreachable |
| **SEV2** | Major feature broken, significant degradation | 30 minutes | Interviews cannot start, feedback not generating |
| **SEV3** | Minor feature broken, degradation that has workaround | 4 hours | Slow dashboard, occasional error |
| **SEV4** | Cosmetic issues, no user impact | Next business day | Typo, minor UI bug |

---

## Incident Response Procedure

### 1. Acknowledge (5 minutes)

- Acknowledge the incident in the `#incidents` Slack channel.
- Post initial message:
  ```
  🚨 [SEV#] Incident acknowledged
  Investigating: <brief description>
  Incident commander: <your name>
  ```

### 2. Assess

- Check Sentry for errors: https://sentry.io/organizations/interviewpilot
- Check Vercel deployment status
- Check OpenAI API status: https://status.openai.com
- Check Supabase dashboard

### 3. Communicate

- Update the `#incidents` channel every 15 minutes with status.
- If SEV1 or SEV2, notify stakeholders.

### 4. Mitigate

- Apply the fastest fix (rollback deployment, feature flag, restart).
- Prefer mitigation over root cause analysis during active incident.

### 5. Resolve

- Confirm service is restored.
- Post resolution message in `#incidents`.

### 6. Postmortem

- File a postmortem within 48 hours using `docs/templates/postmortem-template.md`.
- blameless — focus on systems, not individuals.

---

## Emergency Contacts

| Role | Contact |
|------|---------|
| Engineering Lead | @NiranjanDevX |
| OpenAI Support | https://help.openai.com |
| Supabase Support | https://supabase.com/dashboard |
| Vercel Support | https://vercel.com/dashboard |

---

## Common Mitigation Steps

### Rollback to previous deployment

1. Go to Vercel Dashboard → Deployments
2. Find the last working deployment
3. Click **Promote to Production**

### Enable maintenance mode

1. Set `MAINTENANCE_MODE=true` in Vercel environment variables
2. Deploy — the app will show a maintenance page

### Disable a feature flag

In `.env.local` or Vercel dashboard:
```
FEATURE_VOICE_INTERVIEW=false
```
