
# User Journeys

**Product:** InterviewPilot AI
**Document:** User Journeys
**Version:** 1.0
**Status:** Draft
**Owner:** Niranjan Sah

---

# 1. Purpose

This document describes how users interact with InterviewPilot AI from onboarding to receiving interview feedback.

The journeys outlined here represent the ideal user experience for the MVP.

---

# Journey 1 — New User

## Goal

Complete a first mock interview.

### Steps

1. Visit InterviewPilot AI
2. Create an account
3. Verify credentials (future enhancement)
4. Log in
5. Access dashboard
6. Start first interview

### Success

User begins an interview within two minutes.

---

# Journey 2 — Configure Interview

## Goal

Create a personalized interview session.

### Steps

1. Select interview type
2. Choose experience level
3. Select target role
4. Review interview summary
5. Start interview

### Success

User understands what interview they are about to begin.

---

# Journey 3 — Voice Interview

## Goal

Complete an AI-driven interview.

### Steps

1. AI introduces itself
2. AI asks opening question
3. Candidate responds using voice
4. AI evaluates response
5. AI decides next action:
   - Ask follow-up
   - Challenge response
   - Move to next topic
6. Repeat until interview completes

### Success

Conversation feels natural and adaptive.

---

# Journey 4 — Review Feedback

## Goal

Understand interview performance.

### Steps

1. AI generates report
2. User views overall score
3. Review strengths
4. Review improvement areas
5. Read suggested answers
6. View transcript

### Success

User leaves with actionable insights.

---

# Journey 5 — Returning User

## Goal

Track improvement over time.

### Steps

1. Login
2. View dashboard
3. Review previous interviews
4. Compare reports
5. Start another interview

### Success

User continues practicing regularly.

---

# Error Journey

## Lost Internet Connection

System should:

- Notify the user
- Pause interview
- Attempt reconnection
- Preserve interview state where possible

---

## Microphone Access Denied

System should:

- Explain why microphone access is required
- Provide retry option
- Prevent interview start until permission is granted

---

## AI Service Failure

System should:

- Display friendly error message
- Log failure
- Allow user to retry

---

# User Flow

```
Landing Page
      │
      ▼
Signup / Login
      │
      ▼
Dashboard
      │
      ▼
Interview Setup
      │
      ▼
Voice Interview
      │
      ▼
Feedback Report
      │
      ▼
Interview History
```

---

# UX Principles

- Minimize friction
- Keep interactions predictable
- Provide immediate feedback
- Avoid unnecessary forms
- Maintain conversational flow

---

# Related Documents

- 04-user-personas.md
- 06-functional-requirements.md

