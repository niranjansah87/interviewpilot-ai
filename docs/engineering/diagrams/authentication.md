# Authentication Flow

```mermaid
sequenceDiagram
    participant Browser
    participant Next.js as Next.js (Route Handler)
    participant Prisma as Prisma ORM
    participant PostgreSQL as PostgreSQL

    Note over Browser: User submits login form

    Browser->>Next.js: POST /api/auth/login<br/>{ email, password }

    Next.js->>Prisma: findUnique(user) by email

    Prisma->>PostgreSQL: SELECT users WHERE email = ?

    alt User not found
        PostgreSQL-->>Prisma: null
        Prisma-->>Next.js: null
        Next.js-->>Browser: 401 { code: "INVALID_CREDENTIALS" }
    else User found
        PostgreSQL-->>Prisma: User row
        Prisma-->>Next.js: User
        Next.js->>Next.js: bcrypt.compare(password, hash)

        alt Password mismatch
            Next.js-->>Browser: 401 { code: "INVALID_CREDENTIALS" }
        else Password match
            Next.js->>Next.js: Generate JWT (access + refresh)
            Next.js->>Next.js: Create CSRF token

            Note over Next.js: Set httpOnly cookies:<br/>access_token (15min)<br/>refresh_token (7d)<br/>csrf_token (7d)

            Next.js-->>Browser: 200 { user, token_type }
        end
    end

    Note over Browser: Subsequent requests include cookies automatically
```

---

## Registration Flow

```mermaid
sequenceDiagram
    participant Browser
    participant Next.js as Next.js (Route Handler)
    participant Prisma as Prisma ORM
    participant PostgreSQL as PostgreSQL

    Browser->>Next.js: POST /api/auth/register<br/>{ email, password }

    Next.js->>Prisma: findUnique(user) by email

    Prisma->>PostgreSQL: SELECT users WHERE email = ?

    alt Email already exists
        PostgreSQL-->>Prisma: User row
        Prisma-->>Next.js: User
        Next.js-->>Browser: 409 { code: "EMAIL_EXISTS" }
    else Email available
        PostgreSQL-->>Prisma: null
        Prisma-->>Next.js: null
        Next.js->>Next.js: bcrypt.hash(password, 12)
        Next.js->>Prisma: createUser({ email, hash })

        Prisma->>PostgreSQL: INSERT INTO users ...

        Next.js->>Next.js: Generate JWT (access + refresh)

        Next.js-->>Browser: 201 { user, token_type }
    end
```

---

## Token Refresh Flow

```mermaid
sequenceDiagram
    participant Browser
    participant Next.js as Next.js (Route Handler)
    participant Prisma as Prisma ORM
    participant PostgreSQL as PostgreSQL

    Note over Browser: Access token expired

    Browser->>Next.js: POST /api/auth/refresh<br/>(includes httpOnly refresh_token cookie)

    Next.js->>Prisma: findUnique(refreshToken) by token

    Prisma->>PostgreSQL: SELECT refresh_tokens WHERE token = ?

    alt Token not found or expired
        PostgreSQL-->>Prisma: null
        Prisma-->>Next.js: null
        Next.js-->>Browser: 401 { code: "SESSION_EXPIRED" }
    else Token valid
        PostgreSQL-->>Prisma: RefreshToken row
        Prisma-->>Next.js: RefreshToken + User
        Next.js->>Next.js: Verify token not revoked
        Next.js->>Next.js: Generate new access + refresh tokens
        Next.js->>Prisma: Revoke old refresh token

        Prisma->>PostgreSQL: UPDATE refresh_tokens SET revoked = true

        Next.js-->>Browser: 200 { access_token, refresh_token }
    end
```

---

## JWT Verification on Protected Routes

```mermaid
flowchart LR
    A["Browser Request<br/>Cookie: access_token"] --> B["Route Handler<br/>/api/interviews"]
    B --> C["Verify JWT<br/>HS256 signature"]
    C --> D{Valid?}
    D -->|No| E["401 Unauthorized<br/>{ code: 'INVALID_TOKEN' }"]
    D -->|Yes| F["Check expiry (exp)"]
    F --> G{Not expired?}
    G -->|Expired| H["401 Unauthorized<br/>{ code: 'TOKEN_EXPIRED' }"]
    G -->|Valid| I["Attach user to request<br/>proceed to handler"]
```

---

## Security Measures Summary

| Threat | Mitigation |
|--------|-----------|
| XSS (cookie theft) | httpOnly cookies, no localStorage for tokens |
| CSRF | Double-submit cookie pattern with CSRF token |
| Brute force login | Rate limiting: 5 attempts / 15 min per IP |
| Token theft | Short-lived access tokens (15 min), refresh token rotation |
| Password storage | bcrypt cost factor 12, never stored plaintext |
| Privilege escalation | JWT scope validation on every request |
