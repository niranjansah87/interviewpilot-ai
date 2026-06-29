# Deployment Topology

```mermaid
flowchart TB
    subgraph Internet
        Browser["Browser<br/>(HTTPS)"]
    end

    subgraph Vercel["Vercel (Frontend + Edge)"]
        NextJS["Next.js App<br/>SSR + Static"]
        RouteHandlers["Route Handlers<br/>/api/*"]
    end

    subgraph External["External Services"]
        OpenAI["OpenAI API<br/>(Realtime + GPT-4)"]
        Supabase["Supabase<br/>(PostgreSQL + Auth)"]
    end

    subgraph Monitoring["Observability"]
        Sentry["Sentry<br/>(Errors)"]
        VercelAnalytics["Vercel Analytics<br/>(Perf)"]
    end

    Browser -->|"HTTPS"| NextJS
    NextJS -->|"Server Components"| RouteHandlers
    RouteHandlers -->|"SQL Queries"| Supabase
    RouteHandlers -->|"AI Streaming"| OpenAI
    NextJS -->|"Client Errors"| Sentry
    RouteHandlers -->|"Server Errors"| Sentry
    NextJS -->|"Web Vitals"| VercelAnalytics

    style Vercel fill:#000,stroke:#fff,color:#fff
    style Supabase fill:#3ECF8E,stroke:#fff,color:#fff
    style OpenAI fill:#10A37F,stroke:#fff,color:#fff
    style Sentry fill:#FF6B6B,stroke:#fff,color:#fff
```

---

## CI/CD Pipeline

```mermaid
flowchart LR
    A["git push"] --> B["GitHub Actions<br/>CI Workflow"]

    B --> C{"All checks pass?"}
    C -->|No| D["PR Failed<br/>Notify author"]
    C -->|Yes| E["Merge to main"]

    E --> F["Auto-deploy<br/>to Staging"]
    F --> G{"Manual approval?"}
    G -->|No| H["Await approval"]
    G -->|Yes| I["Deploy to<br/>Production"]
    H --> G

    I --> J["Create GitHub<br/>Release + Tag"]

    style F fill:#3B82F6,stroke:#fff,color:#fff
    style I fill:#10B981,stroke:#fff,color:#fff
    style D fill:#EF4444,stroke:#fff,color:#fff
```

---

## Environment Configuration

```mermaid
flowchart TD
    subgraph Development
        D1["localhost:3000"]
        D2[".env.local"]
    end

    subgraph Staging
        S1["staging.interviewpilot.ai"]
        S2["Vercel Environment<br/>Variables"]
    end

    subgraph Production
        P1["interviewpilot.ai"]
        P2["Vercel Environment<br/>Variables + Secrets"]
    end

    D2 -.->|"Same shape"| S2 -.->|"Same shape"| P2

    Note over D1,P1: All environments share the same Prisma schema and API contract
```

---

## Database Migration Strategy

```mermaid
flowchart LR
    A["prisma/schema.prisma"] --> B["prisma migrate dev"]
    B --> C["migration.sql"]
    C --> D["Applied to<br/>Development DB"]
    D --> E["prisma migrate deploy"]
    E --> F["Applied to<br/>Staging & Prod"]
```

---

## Rollback Procedure

```mermaid
flowchart TD
    A["Alert: Production issue detected"] --> B["Identify affected version"]
    B --> C["Vercel Dashboard:<br/>Select previous deployment"]
    C --> D["Instant rollback<br/>(zero downtime)"]
    D --> E["Notify team in Slack<br/>#incidents channel"]
    E --> F["Root cause analysis"]
    F --> G["Fix in feature branch<br/>+ tests"]
    G --> H["PR + review"]
    H --> I["Deploy fix after<br/>validation"]
```
