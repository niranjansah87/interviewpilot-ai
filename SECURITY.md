# Security

**Product:** InterviewPilot AI
**Document:** Security Guidelines
**Version:** 1.0
**Status:** Draft
**Owner:** Niranjan Sah

---

# 1. Purpose

This document defines the security requirements and guidelines for InterviewPilot AI.

---

# 2. Authentication Security

## Password Storage

- Passwords hashed using **bcrypt**
- Salt rounds: minimum 12
- Never store plaintext passwords

## JWT Security

- Access token expiry: **15 minutes**
- Refresh token expiry: **7 days**
- Tokens signed with **HS256** (or RS256 for future)
- Refresh tokens stored server-side

## Token Storage

- Access tokens in memory (not localStorage)
- Refresh tokens in HttpOnly cookies
- CSRF protection via double-submit cookie

---

# 3. Authorization

## Ownership Validation

Users can only access their own:
- Interview sessions
- Transcripts
- Feedback reports

## Protected Routes

All `/api/*` routes except `/auth/*` require authentication.

---

# 4. Input Validation

## Client-Side

- Form validation before submission
- Type checking with TypeScript

## Server-Side

- Pydantic models for all inputs
- Strict type enforcement
- SQL injection prevention via ORM
- XSS prevention via output encoding

---

# 5. API Security

## Rate Limiting

- 100 requests per minute per user
- Stricter limits on auth endpoints

## CORS

- Configured for known origins only
- No wildcard in production

## Helmet

- Security headers via Helmet middleware

---

# 6. Data Protection

## Sensitive Data

- API keys in environment variables
- No secrets in code or config files
- Credentials excluded from logs

## Database

- SSL connections required
- Principle of least privilege
- Regular backups

---

# 7. Security Headers

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
Content-Security-Policy: default-src 'self'
```

---

# 8. Dependencies

- Regular `npm audit` / `pip audit`
- Keep dependencies updated
- Pin critical dependencies

---

# 9. Related Documents

- 05-API.md
- 02-TECHSTACK.md
