
# MVP Scope

**Product:** InterviewPilot AI
**Document:** MVP Scope
**Version:** 1.0
**Status:** Draft
**Owner:** Niranjan Sah

---

# 1. Purpose

This document defines the minimum viable product (MVP) scope for InterviewPilot AI.

The MVP focuses on delivering the smallest feature set capable of providing a complete, high-quality interview experience while maintaining engineering quality.

---

# 2. MVP Objectives

The MVP should allow a user to:

1. Create an account.
2. Configure an interview.
3. Complete a voice interview.
4. Receive AI-generated feedback.
5. Review previous interviews.

---

# 3. In Scope

## Authentication

- User registration
- Login
- JWT authentication
- Logout

---

## Dashboard

- Start interview
- Interview history
- Previous reports

---

## Interview Configuration

- Interview type
- Experience level
- Target role

---

## AI Interview

- Voice conversation
- Dynamic follow-up questions
- Context-aware interviewer
- Session persistence

---

## Feedback

- Overall score
- Communication analysis
- Strengths
- Weaknesses
- Suggested improvements
- Transcript

---

## Persistence

- User accounts
- Interview sessions
- Reports
- Conversation history

---

# 4. Out of Scope

The following features are intentionally excluded from the MVP.

## Resume Upload

Deferred.

---

## Resume Analysis

Deferred.

---

## ATS Optimization

Deferred.

---

## Coding Interview IDE

Deferred.

---

## Live Video Interviews

Deferred.

---

## Team Interviews

Deferred.

---

## Interview Scheduling

Deferred.

---

## OAuth Login

Deferred.

---

## Recruiter Dashboard

Deferred.

---

## Enterprise Features

Deferred.

---

## AI Personas

Deferred.

---

## Mobile Application

Deferred.

---

# 5. MVP Constraints

Development priorities:

- Quality over quantity.
- Conversation realism over feature count.
- Stable architecture over experimentation.
- Production readiness over prototype shortcuts.

---

# 6. Definition of Done

The MVP is considered complete when a new user can:

- Register successfully.
- Start an interview.
- Complete a natural voice conversation.
- Receive an AI-generated feedback report.
- View interview history.
- Repeat the process without manual intervention.

---

# 7. Risks

Potential risks include:

- AI response latency.
- Browser microphone compatibility.
- Network instability.
- External AI service availability.

The architecture should minimize the impact of these risks wherever possible.

---

# Related Documents

- 08-success-metrics.md
- 10-future-roadmap.md

