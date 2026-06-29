-- InterviewPilot AI — Index Definitions
-- Additional indexes beyond the base schema for query performance.

-- Session lookup by user + status (dashboard queries)
CREATE INDEX CONCURRENTLY IF NOT EXISTS
idx_sessions_user_status ON interview_sessions(user_id, status)
WHERE status IN ('active', 'completed');

-- Transcript ordering by session + time (streaming display)
CREATE INDEX CONCURRENTLY IF NOT EXISTS
idx_transcript_session_created
ON transcript_entries(session_id, created_at ASC);

-- Report lookup by user + date (dashboard sorting)
CREATE INDEX CONCURRENTLY IF NOT EXISTS
idx_reports_user_date
ON feedback_reports(session_id)
INCLUDE (created_at);

-- Token cleanup (expired token purging)
CREATE INDEX CONCURRENTLY IF NOT EXISTS
idx_refresh_tokens_expires
ON refresh_tokens(expires_at)
WHERE revoked = FALSE;
