# System Architecture

```mermaid
graph TB
    subgraph Browser["Browser (Client)"]
        UI["React 19 / Next.js 16"]
        WebAudio["Web Audio API\nAudioContext\nAnalyserNode\nVAD"]
        WebSocket["WebSocket Client\n(ElevenLabs ConvAI)"]
        State["Zustand + React Query\nState Management"]
    end

    subgraph NextJS["Next.js Edge"]
        Proxy["proxy.ts\nSecurity Headers\nAuth Redirects\nCSRF Check"]
        Routes["API Routes\n/api/v1/*"]
        MW["Rate Limiter\nauthRateLimit()"]
    end

    subgraph Services["Service Layer"]
        AuthSvc["Auth Service\nregister/login/refresh/logout"]
        InterviewSvc["Interview Service\nCRUD + Scheduling"]
        FeedbackSvc["Feedback Service\nGPT-4.1-mini Analysis"]
    end

    subgraph Engine["Conversation Engine"]
        StateMachine["State Machine\n8 states / 11 events"]
        ContextEngine["Context Engine\nResume + Profile + Role"]
        PromptEngine["Prompt Engine\nModular Blocks"]
        TokenMgr["Token Manager\n100K budget/session"]
    end

    subgraph AI["AI Provider Layer"]
        ProviderInterface["AIProvider Interface"]
        ElevenLabs["ElevenLabs ConvAI\nPrimary Voice Provider\nWebSocket + TTS"]
        OpenAI["OpenAI Adapter\nFeedback Generation\nFallback Voice"]
        Registry["Provider Registry\nVOICE_PROVIDER env\nFallback Chain"]
    end

    subgraph Data["Data Layer"]
        Repo["Repository Layer\nCache-Aside Pattern"]
        Prisma["Prisma ORM"]
        Cache["Cache Layer\nRedis + Memory Fallback"]
        DB["PostgreSQL\n(Supabase)"]
    end

    Browser --> NextJS
    UI --> WebAudio
    UI --> WebSocket
    UI --> State
    Routes --> MW
    Routes --> AuthSvc
    Routes --> InterviewSvc
    Routes --> FeedbackSvc
    InterviewSvc --> Engine
    FeedbackSvc --> Engine
    Engine --> AI
    AI --> ProviderInterface
    ProviderInterface --> Registry
    Registry --> ElevenLabs
    Registry --> OpenAI
    Services --> Repo
    Repo --> Prisma
    Repo --> Cache
    Prisma --> DB
    Cache --> DB
    Engine --> Repo

    style Browser fill:#1a1a2e,stroke:#6366f1,color:#e2e8f0
    style NextJS fill:#1a1a2e,stroke:#6366f1,color:#e2e8f0
    style Services fill:#16213e,stroke:#8b5cf6,color:#e2e8f0
    style Engine fill:#16213e,stroke:#10b981,color:#e2e8f0
    style AI fill:#0f3460,stroke:#60a5fa,color:#e2e8f0
    style Data fill:#0f3460,stroke:#f59e0b,color:#e2e8f0
```

## Key Components

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 16 + React 19 | App Router, Client/Server Components |
| **Audio** | Web Audio API | Shared AudioContext, AnalyserNodes, VAD |
| **Voice** | ElevenLabs ConvAI | Primary voice provider (WebSocket + GPT-4o) |
| **Auth** | JWT (jose) + bcrypt | httpOnly cookies, refresh rotation, SHA-256 |
| **Cache** | Redis + Memory | Cache-aside pattern, automatic fallback |
| **Database** | PostgreSQL (Supabase) | Prisma ORM, 5 models, cascade deletes |
| **Feedback** | GPT-4.1-mini | Transcript analysis, structured scoring |
| **Deployment** | Vercel | Edge functions, automatic scaling |
