# Authentication Flow

```mermaid
sequenceDiagram
    actor C as Candidate
    participant FE as Browser
    participant Proxy as proxy.ts
    participant API as Auth Routes
    participant Svc as Auth Service
    participant DB as PostgreSQL

    Note over C,DB: Registration
    C->>FE: POST /auth/register
    FE->>Proxy: {email, password, name}
    Proxy->>API: rate limit check (10/15min)
    API->>Svc: register(input)
    Svc->>DB: check duplicate email
    Svc->>Svc: bcrypt.hash(password, 12)
    Svc->>DB: INSERT user
    API-->>FE: 201 { user }

    Note over C,DB: Login
    C->>FE: POST /auth/login
    FE->>Proxy: {email, password}
    Proxy->>API: rate limit check
    API->>Svc: login(input)
    Svc->>DB: find user by email
    Svc->>Svc: bcrypt.compare(password, hash)
    Svc->>Svc: signAccessToken (15min)
    Svc->>Svc: signRefreshToken (7d)
    Svc->>Svc: hashToken(refresh, SHA-256)
    Svc->>DB: INSERT refresh_token (hash)
    API->>FE: setCookie(access, httpOnly)
    API->>FE: setCookie(refresh, httpOnly)
    API->>FE: setCsrfCookie(token)
    API-->>FE: 200 { user }

    Note over C,DB: Protected Request
    C->>FE: GET /dashboard
    FE->>Proxy: Cookie: ip_access_token
    Proxy->>Proxy: verify cookie exists
    Proxy-->>FE: allow / redirect to login

    Note over C,DB: Token Refresh
    C->>FE: POST /auth/refresh
    FE->>API: Cookie: ip_refresh_token
    API->>Svc: refresh(token)
    Svc->>Svc: verifyRefreshToken
    Svc->>DB: find hash, check not revoked
    Svc->>DB: revoke old token
    Svc->>Svc: sign new pair
    Svc->>DB: INSERT new hash
    API->>FE: setCookies(new tokens)

    Note over C,DB: Logout
    C->>FE: POST /auth/logout
    API->>Svc: logout(token)
    Svc->>DB: revokeAllForUser
    API->>FE: clearCookies
```

## Security Layers

| Layer | Implementation |
|-------|---------------|
| Password | bcrypt (cost 12), min 8 chars |
| Access Token | JWT (HS256), 15min, httpOnly cookie |
| Refresh Token | JWT (HS256), 7d, httpOnly, SHA-256 hash stored |
| Rotation | Old token revoked on refresh, reuse detection |
| CSRF | Double-submit cookie (ip_csrf) + x-csrf-token header |
| Rate Limit | 10 req/15min per IP on auth endpoints |
| Proxy | Security headers, auth redirects |
