# Database Schema (Prisma)

```mermaid
erDiagram
    User ||--o{ InterviewSession : "has"
    User ||--o| Resume : "has"
    User ||--o{ RefreshToken : "has"
    InterviewSession ||--o{ TranscriptEntry : "contains"
    InterviewSession ||--o| FeedbackReport : "generates"

    User {
        string id PK "cuid()"
        string email UK "unique"
        string passwordHash "bcrypt 12 rounds"
        string name "nullable"
        enum role "USER | ADMIN"
        datetime createdAt
        datetime updatedAt
    }

    InterviewSession {
        string id PK "cuid()"
        string userId FK "CASCADE"
        enum type "BEHAVIORAL | TECHNICAL | MIXED"
        string targetRole "nullable"
        enum experienceLevel "JUNIOR | MID | SENIOR"
        enum status "CREATED | READY | ACTIVE | COMPLETED | FAILED | SCHEDULED | CANCELLED"
        datetime scheduledAt "nullable"
        datetime startedAt "nullable"
        datetime endedAt "nullable"
        int durationSeconds "nullable"
        datetime createdAt
    }

    TranscriptEntry {
        string id PK "cuid()"
        string sessionId FK "CASCADE"
        enum role "INTERVIEWER | CANDIDATE"
        string content "Text"
        string audioUrl "nullable"
        datetime createdAt
    }

    FeedbackReport {
        string id PK "cuid()"
        string sessionId FK "CASCADE (unique)"
        int overallScore "0-100"
        int communicationScore "0-100"
        int confidenceScore "0-100"
        int technicalReasoning "nullable"
        json strengths "[string]"
        json weaknesses "[string]"
        json improvements "[string]"
        string summary "Text"
        datetime createdAt
    }

    Resume {
        string id PK "cuid()"
        string userId FK "CASCADE (unique)"
        string rawText "Text (10K max)"
        string fullName "nullable"
        string email "nullable"
        string phone "nullable"
        string location "nullable"
        string summary "nullable"
        json skills "[string]"
        json experience "[{title,company,duration,highlights}]"
        json education "[{degree,school,year}]"
        json projects "[{name,description,technologies}]"
        string linkedin "nullable"
        string github "nullable"
        datetime createdAt
        datetime updatedAt
    }

    RefreshToken {
        string id PK "cuid()"
        string userId FK "CASCADE"
        string tokenHash "SHA-256"
        datetime expiresAt
        bool revoked "default false"
        datetime createdAt
    }
```

## Indexes

| Table | Index | Type |
|-------|-------|------|
| interview_sessions | userId | B-tree |
| interview_sessions | status | B-tree |
| transcript_entries | sessionId | B-tree |
| transcript_entries | (sessionId, createdAt) | Composite |
| refresh_tokens | userId | B-tree |
| refresh_tokens | expiresAt | B-tree |

## Cache Strategy

| Entity | TTL | Invalidation |
|--------|-----|-------------|
| User | 15 min | On create/update/delete |
| Interview (single) | 1 hour | On status change |
| Interview (list) | 5 min | On create/status change |
| Resume | None | Always fresh (auto-save) |
| Token hashes | None | No caching (security) |
