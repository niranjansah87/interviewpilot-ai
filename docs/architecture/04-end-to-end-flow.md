# End-to-End Interview Flow

```mermaid
sequenceDiagram
    actor C as Candidate
    participant FE as Frontend (Next.js)
    participant API as API Routes
    participant Auth as Auth Service
    participant Svc as Interview Service
    participant Engine as Conversation Engine
    participant AI as ElevenLabs ConvAI
    participant DB as PostgreSQL
    participant Feedback as Feedback Service

    C->>FE: Register / Login
    FE->>API: POST /auth/login
    API->>Auth: validate credentials
    Auth->>DB: verify password (bcrypt)
    API-->>FE: JWT in httpOnly cookie

    C->>FE: Create Interview
    FE->>API: POST /interviews
    API->>Svc: create(type, role, level)
    Svc->>DB: INSERT interview_sessions
    API-->>FE: Interview created

    C->>FE: Upload Resume
    FE->>API: POST /users/me/resume
    API->>DB: UPSERT resumes (auto-save)

    C->>FE: Begin Interview
    FE->>API: POST /voice/connect
    API->>AI: get_signed_url(agent_id)
    AI-->>API: signed WebSocket URL
    API-->>FE: { signedUrl }

    FE->>AI: WebSocket connect
    FE->>AI: contextual_update(candidate profile)
    AI-->>FE: conversation_initiation_metadata
    AI-->>FE: audio_event (first message)

    loop Conversation
        C->>AI: Speak (PCM16 audio chunks)
        AI->>Engine: GPT-4o processes response
        AI-->>FE: audio_event (AI response)
        AI-->>FE: agent_response (transcript)
        FE->>API: POST /transcript (save entry)
        API->>DB: INSERT transcript_entries
    end

    C->>FE: End Interview
    FE->>API: PATCH /interviews (status=COMPLETED)
    FE->>API: POST /interviews/[id]/report
    API->>Feedback: generate(transcript)
    Feedback->>AI: GPT-4.1-mini analysis
    AI-->>Feedback: structured JSON scores
    Feedback->>DB: INSERT feedback_reports
    Feedback-->>FE: report with scores

    C->>FE: View Report
    FE->>API: GET /interviews/[id]/report
    API-->>FE: feedback report
```

## Key Events

| Step | Duration | Notes |
|------|----------|-------|
| Login → Dashboard | ~500ms | JWT verify + cookie set |
| Create Interview | ~200ms | DB insert |
| Voice Connect | ~700ms | ElevenLabs signed URL API |
| First Response | ~2s | Agent initial_wait_time 1s |
| Per-turn Latency | ~1-3s | GPT-4o processing time |
| Feedback Generation | ~5-15s | GPT-4.1-mini analysis |
