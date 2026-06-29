-- InterviewPilot AI — Seed Data
-- Development and staging only. Never run in production.

-- Sample users (password: TestPassword123!)
-- bcrypt hash of 'TestPassword123!' with cost factor 12

INSERT INTO users (id, email, password_hash, name) VALUES
  ('00000000-0000-0000-0000-000000000001',
   'demo@interviewpilot.ai',
   '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.FpgH.5Mq6.5OLS',
   'Demo User'),

  ('00000000-0000-0000-0000-000000000002',
   'alex.johnson@example.com',
   '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.FpgH.5Mq6.5OLS',
   'Alex Johnson');

-- Sample sessions
INSERT INTO interview_sessions (id, user_id, type, target_role, experience_level, status, duration_seconds, created_at) VALUES
  ('00000000-0000-0000-0001-000000000001',
   '00000000-0000-0000-0000-000000000001',
   'behavioral',
   'Software Engineer',
   'mid',
   'completed',
   1320,
   NOW() - INTERVAL '7 days'),

  ('00000000-0000-0000-0001-000000000002',
   '00000000-0000-0000-0000-000000000001',
   'behavioral',
   'Senior Software Engineer',
   'senior',
   'completed',
   1560,
   NOW() - INTERVAL '1 day');
