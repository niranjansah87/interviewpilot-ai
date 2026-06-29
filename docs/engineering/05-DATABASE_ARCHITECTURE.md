# Database Architecture

**Product:** InterviewPilot AI
**Document:** Database Architecture
**Version:** 1.0
**Status:** Draft
**Owner:** Niranjan Sah

---

# 1. Purpose

This document defines the database architecture for InterviewPilot AI.

The database is responsible for storing user accounts, interview sessions, conversation transcripts, AI evaluations, and feedback reports while maintaining data integrity, scalability, and long-term maintainability.

The architecture follows a relational model centered around interview sessions, treating each interview as an independent entity that links users, conversations, and generated feedback.

---

# 2. Design Principles

The database design follows these principles:

* Normalize where practical
* Avoid unnecessary joins
* Preserve complete interview history
* Maintain auditability
* Support future expansion
* Prefer immutable interview records
* Minimize redundant data
* Optimize for read-heavy workloads

---

# 3. Database Technology

## Database Engine

PostgreSQL

### Why PostgreSQL?

* ACID compliance
* Strong relational modeling
* JSON support
* Excellent indexing
* Mature ecosystem
* Future scalability

---

## ORM

Prisma ORM

Reasons:

* Type-safe queries
* Excellent migration tooling
* Strong TypeScript integration
* Maintainable schema evolution

---

# 4. High-Level Entity Diagram

```text
User
 │
 │ 1
 │
 │ N
 ▼
InterviewSession
 │
 ├──────────────┐
 │              │
 ▼              ▼
Transcript   FeedbackReport
 │
 │
 ▼
TranscriptMessage
```

Every interview session becomes the central aggregate for all interview-related data.

---

# 5. Core Entities

## User

Represents a registered user.

Stores:

* Authentication details
* Profile information
* Preferences
* Interview history

Relationships

```
User

1 → N Interview Sessions
```

---

## Interview Session

Represents one interview.

Stores:

* Interview Type
* Role
* Experience Level
* Duration
* Status
* AI Configuration
* Metadata

Status values:

* Pending
* Active
* Completed
* Cancelled
* Failed

---

## Transcript

Each interview owns one transcript.

Stores:

* Session summary
* Metadata
* AI provider
* Token statistics
* Duration

Transcript content is separated into transcript messages.

---

## Transcript Message

Stores individual conversation messages.

Each message contains:

* Speaker
* Timestamp
* Message Type
* Content
* Sequence Number

Speaker values:

* User
* AI
* System

---

## Feedback Report

Generated once an interview completes.

Stores:

* Overall Score
* Communication
* Technical Knowledge
* Confidence
* Strengths
* Weaknesses
* Recommendations

Feedback remains immutable once generated.

---

# 6. Relationships

```
User

1

↓

InterviewSession

1

↓

Transcript

1

↓

TranscriptMessage
```

and

```
InterviewSession

1

↓

FeedbackReport
```

---

# 7. Interview Lifecycle

```text
Create User

↓

Create Interview Session

↓

Start Conversation

↓

Persist Messages

↓

Generate Report

↓

Store Feedback

↓

Completed
```

Interview data should never be overwritten after completion.

---

# 8. Persistence Strategy

The platform persists data incrementally.

Immediately stored:

* User
* Session
* Transcript messages

Generated after completion:

* Evaluation
* Feedback
* Final report

This minimizes data loss in unexpected interruptions.

---

# 9. Indexing Strategy

Primary indexes:

* User Email
* Session Status
* Created At
* User ID

Composite indexes:

* User + Created At
* Session + Status

Future indexes:

* Role
* Interview Type
* Experience Level

---

# 10. Audit Fields

Every table should include:

* id
* createdAt
* updatedAt

Optional:

* deletedAt (future soft delete)

Interview records should never be permanently modified.

---

# 11. Transactions

Database transactions should be used when:

* Creating interviews
* Completing interviews
* Generating reports

This ensures data consistency.

---

# 12. Data Integrity

Foreign key constraints should enforce:

* Session ownership
* Transcript ownership
* Feedback ownership

Cascade deletion should be avoided for completed interview history.

---

# 13. Future Expansion

The schema should support future entities such as:

* Resume
* Job Description
* Company
* Coding Submission
* AI Persona
* Interview Template
* Organization
* Team Workspace

without requiring major schema redesign.

---

# 14. Migration Strategy

Schema evolution follows:

1. Create migration
2. Review migration
3. Apply locally
4. Test
5. Deploy

Destructive migrations should be avoided.

---

# 15. Related Documents

* AI_ENGINE.md
* API.md
* SECURITY.md
* ARCHITECTURE.

# Database

**Product:** InterviewPilot AI
**Document:** Database Schema
**Version:** 1.0
**Status:** Draft
**Owner:** Niranjan Sah

---

# 1. Purpose

This document describes the database schema for InterviewPilot AI, covering entity relationships, table structures, and design decisions.

---

# 2. Database Engine

**PostgreSQL 15+**

Chosen for relational integrity, JSON support for transcripts, and async driver compatibility.

---

# 3. Entity Relationship

```
User
  ├── InterviewSession (1:N)
  │     └── TranscriptEntry (1:N)
  └── FeedbackReport (1:1)
```

---

# 4. Tables

## Users

| Column        | Type         | Constraints      |
| ------------- | ------------ | ---------------- |
| id            | UUID         | PK               |
| email         | VARCHAR(255) | UNIQUE, NOT NULL |
| password_hash | VARCHAR(255) | NOT NULL         |
| created_at    | TIMESTAMP    | NOT NULL         |
| updated_at    | TIMESTAMP    | NOT NULL         |

## Interview Sessions

| Column           | Type         | Constraints |
| ---------------- | ------------ | ----------- |
| id               | UUID         | PK          |
| user_id          | UUID         | FK → Users |
| interview_type   | VARCHAR(100) | NOT NULL    |
| target_role      | VARCHAR(100) | NOT NULL    |
| experience_level | VARCHAR(50)  | NOT NULL    |
| status           | VARCHAR(20)  | NOT NULL    |
| started_at       | TIMESTAMP    | NULL        |
| ended_at         | TIMESTAMP    | NULL        |
| duration_seconds | INTEGER      | NULL        |
| created_at       | TIMESTAMP    | NOT NULL    |

## Transcript Entries

| Column     | Type         | Constraints                      |
| ---------- | ------------ | -------------------------------- |
| id         | UUID         | PK                               |
| session_id | UUID         | FK → InterviewSessions          |
| role       | VARCHAR(20)  | NOT NULL (interviewer/candidate) |
| content    | TEXT         | NOT NULL                         |
| audio_url  | VARCHAR(500) | NULL                             |
| created_at | TIMESTAMP    | NOT NULL                         |

## Feedback Reports

| Column              | Type      | Constraints                     |
| ------------------- | --------- | ------------------------------- |
| id                  | UUID      | PK                              |
| session_id          | UUID      | FK → InterviewSessions, UNIQUE |
| overall_score       | INTEGER   | NOT NULL                        |
| communication_score | INTEGER   | NOT NULL                        |
| confidence_score    | INTEGER   | NOT NULL                        |
| strengths           | JSON      | NOT NULL                        |
| weaknesses          | JSON      | NOT NULL                        |
| improvements        | JSON      | NOT NULL                        |
| summary             | TEXT      | NOT NULL                        |
| created_at          | TIMESTAMP | NOT NULL                        |

---

# 5. Indexes

- `idx_sessions_user_id` on InterviewSessions(user_id)
- `idx_sessions_status` on InterviewSessions(status)
- `idx_transcript_session_id` on TranscriptEntries(session_id)
- `idx_reports_session_id` on FeedbackReports(session_id)

---

# 6. Migrations

Migrations are managed using Alembic.

---

# 7. Related Documents

- 01-ARCHITECTURE.md
- 02-TECHSTACK.md

