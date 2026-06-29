-- InterviewPilot AI — Database Schema (Placeholder)
-- This file is for reference and documentation only.
-- Actual migrations are managed via Prisma Migrate (prisma/migrations/).

-- Users
CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name        VARCHAR(255),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Interview Sessions
CREATE TABLE interview_sessions (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type             VARCHAR(100) NOT NULL,
    target_role      VARCHAR(100),
    experience_level VARCHAR(50),
    status           VARCHAR(20) NOT NULL DEFAULT 'created',
    started_at       TIMESTAMPTZ,
    ended_at         TIMESTAMPTZ,
    duration_seconds  INTEGER,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Transcript Entries
CREATE TABLE transcript_entries (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id  UUID NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
    role        VARCHAR(20) NOT NULL,  -- 'interviewer' | 'candidate'
    content     TEXT NOT NULL,
    audio_url   VARCHAR(500),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Feedback Reports
CREATE TABLE feedback_reports (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id            UUID UNIQUE NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
    overall_score         INTEGER NOT NULL,
    communication_score   INTEGER NOT NULL,
    confidence_score      INTEGER NOT NULL,
    technical_reasoning   INTEGER,
    strengths             JSONB NOT NULL DEFAULT '[]',
    weaknesses            JSONB NOT NULL DEFAULT '[]',
    improvements          JSONB NOT NULL DEFAULT '[]',
    summary               TEXT NOT NULL,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Refresh Tokens
CREATE TABLE refresh_tokens (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  VARCHAR(255) NOT NULL,
    expires_at  TIMESTAMPTZ NOT NULL,
    revoked     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sessions_user_id ON interview_sessions(user_id);
CREATE INDEX idx_sessions_status ON interview_sessions(status);
CREATE INDEX idx_transcript_session_id ON transcript_entries(session_id);
CREATE INDEX idx_reports_session_id ON feedback_reports(session_id);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
