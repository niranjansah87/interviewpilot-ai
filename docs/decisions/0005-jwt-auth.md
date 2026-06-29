# ADR-0005: JWT for Authentication

**Status:** Accepted
**Date:** 2026-06-21
**Deciders:** Niranjan Sah

---

## Context

InterviewPilot AI requires secure authentication for user accounts. Users must be able to register, log in, and access protected resources. We evaluated JWT (stateless), sessions (server-side), and OAuth-only approaches.

## Decision

**Use JWT (JSON Web Tokens)** for authentication with an httpOnly cookie transport.

## Rationale

### Why JWT

- **Stateless API** — Our API layer is designed to be stateless. JWTs eliminate the need for a session store (e.g., Redis) for the MVP.
- **Scalability** — Any API server instance can validate a token without consulting a shared session store. This simplifies horizontal scaling.
- **httpOnly cookies** — Tokens are stored in httpOnly cookies, preventing XSS attacks from accessing them via JavaScript. CSRF is addressed via a double-submit cookie pattern.
- **Simplicity** — Implementation is straightforward with well-understood libraries (`jose` on the server, standard Web Crypto API on the client).

### Why Not Alternatives

- **Server-side sessions (Redis)** — Adds a Redis dependency solely for session storage. For the MVP's scale, the operational overhead outweighs the benefits. Revisit if session revocation requirements become complex.
- **OAuth-only** — OAuth is excellent for third-party authentication but adds complexity (provider SDKs, callback handling) we don't need yet. Email + password is the primary auth method for MVP.

## Token Strategy

| Token | Storage | Expiry | Purpose |
|-------|---------|--------|---------|
| `access_token` | httpOnly cookie | 15 minutes | API authorization |
| `refresh_token` | httpOnly cookie | 7 days | Token rotation |
| `csrf_token` | Plain cookie | 7 days | CSRF double-submit |

- Refresh tokens are opaque and stored in the database for revocation capability.
- Access tokens are signed JWTs verified on every request.
- All tokens are scoped to a single user.

## Consequences

### Positive

- No session store required
- Simple horizontal scaling
- Standard, well-understood auth pattern
- Tokens are auditable (decode for inspection)

### Negative

- **Token revocation** — Revoking an access token before expiry requires adding it to a blocklist or shortening expiry. For the MVP, 15-minute access token expiry is an acceptable revocation lag.
- **Token size** — JWTs add ~200 bytes per request. Negligible for our use case.
- **Sensitive data in tokens** — Access tokens are signed, not encrypted. We store only the user ID and expiry, never passwords or sensitive profile data.

## Notes

- All passwords are hashed with **bcrypt** (cost factor 12). We do not use JWT for password storage.
- Failed login attempts are rate-limited (5 attempts per 15 minutes per IP).
- The auth implementation follows the guidelines in [07-SECURITY.md](../engineering/07-SECURITY.md).
