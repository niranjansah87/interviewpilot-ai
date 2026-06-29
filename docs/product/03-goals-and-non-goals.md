
# Goals and Non-Goals

**Product:** InterviewPilot AI
**Document:** Goals and Non-Goals
**Version:** 1.0
**Status:** Draft
**Owner:** Niranjan Sah

---

# 1. Purpose

This document defines the intended scope of InterviewPilot AI.

Clearly documenting goals and non-goals helps prevent unnecessary complexity, aligns engineering decisions, and ensures development effort remains focused on delivering the highest-value experience within the MVP timeline.

---

# 2. Product Goals

## Goal 1

Deliver realistic AI-powered voice interviews.

Candidates should feel they are speaking with an interviewer rather than interacting with a chatbot.

---

## Goal 2

Generate adaptive interview conversations.

The interviewer should:

- ask follow-up questions
- challenge weak answers
- acknowledge strong responses
- move naturally between topics

without relying on predefined question trees.

---

## Goal 3

Provide actionable interview feedback.

Feedback should explain:

- strengths
- weaknesses
- communication quality
- suggested improvements

rather than only assigning scores.

---

## Goal 4

Maintain low interaction latency.

Voice conversations should feel fluid and responsive.

---

## Goal 5

Provide production-quality engineering.

The application should demonstrate:

- clean architecture
- maintainable code
- modular services
- scalable database design
- modern development practices

---

## Goal 6

Support future extensibility.

The architecture should allow additional interview types, AI providers, and evaluation modules without major refactoring.

---

# 3. Engineering Goals

The implementation should prioritize:

- modular architecture
- separation of concerns
- reusable UI components
- reusable AI services
- type safety
- consistent API design
- maintainability

---

# 4. User Experience Goals

Users should be able to:

- create an account
- start an interview
- complete an interview
- receive detailed feedback

without requiring external guidance.

The entire experience should feel polished, modern, and intuitive.

---

# 5. Non-Goals

The MVP intentionally excludes the following features.

## Coding Interview Environment

No embedded code editor.

---

## Live Human Interviewers

No human participation.

---

## Resume Parsing

No resume upload or analysis.

---

## Video Interviews

Voice-only interaction.

---

## Enterprise Features

No organizations, workspaces, or team management.

---

## OAuth Authentication

Email and password authentication only.

---

## Multiple AI Providers

The MVP uses a single AI provider abstraction backed by OpenAI.

---

## Mobile Application

Responsive web application only.

---

## Analytics Platform

Basic interview history only.

Advanced analytics are deferred.

---

# 6. Assumptions

The product assumes:

- users possess a functioning microphone
- internet connectivity is stable
- AI-generated questions provide sufficient realism
- conversational quality has higher value than interview quantity

---

# 7. Trade-offs

To maximize product quality within the available development time, the project intentionally favors:

- depth over breadth
- conversation quality over feature count
- maintainability over rapid prototyping
- production architecture over temporary implementations

---

# 8. Future Expansion

Future releases may introduce:

- technical coding interviews
- system design interviews
- resume-aware interviews
- recruiter dashboards
- AI interviewer personas
- collaborative interviews
- interview replay
- video conversations

These are intentionally excluded from the MVP.

---

# Related Documents

- 02-problem-statement.md
- 04-user-personas.md
- 09-mvp-scope.md

