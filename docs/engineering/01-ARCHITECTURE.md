
# System Architecture

**Product:** InterviewPilot AI
**Document:** System Architecture
**Version:** 1.0
**Status:** Draft
**Owner:** Niranjan Sah

---

# 1. Purpose

This document defines the high-level architecture of InterviewPilot AI, including system boundaries, architectural principles, major components, communication patterns, and design decisions.

The objective is to establish a scalable, maintainable, and production-ready architecture that supports real-time AI-powered interview experiences while remaining modular enough for future expansion.

---

# 2. Architecture Goals

The architecture has been designed around the following principles:

- Modular
- Scalable
- Maintainable
- Secure
- AI-first
- Cloud-ready
- Observable
- Testable

The system should support rapid feature development without tightly coupling business logic to infrastructure or third-party providers.

---

# 3. High-Level Architecture

```text
                        Browser

                           │

                    Next.js Frontend

                           │

              Route Handlers / Server Actions

                           │

                 Application Service Layer

                           │

                 Domain / Business Logic

                           │

          Repository Layer / Data Access Layer

                           │

                 Prisma ORM

                           │

                    PostgreSQL

                           │

──────────────────────────────────────────────

              External Infrastructure

OpenAI Realtime API

Authentication

File Storage

Future AI Providers

Logging

Monitoring
```

---

# 4. Layered Architecture

InterviewPilot AI follows a layered architecture.

## Presentation Layer

Responsibilities

- UI
- Forms
- Authentication screens
- Dashboard
- Interview pages
- Reports

Rules

Presentation components never directly access the database.

---

## Application Layer

Responsibilities

- Coordinate business workflows
- Validation
- Session management
- Authentication
- AI orchestration

Application services communicate with repositories instead of directly accessing Prisma.

---

## Domain Layer

Contains:

- Interview Engine
- Evaluation Logic
- Feedback Generation
- Conversation State

Business rules remain independent of framework implementation.

---

## Infrastructure Layer

Contains:

- Prisma
- OpenAI Provider
- JWT
- External APIs

This layer can be replaced without changing business logic.

---

# 5. Core Modules

The application consists of the following primary modules:

Authentication

Dashboard

Interview Engine

AI Provider

Transcript Management

Feedback Engine

Reporting

Shared UI

Infrastructure

---

# 6. Request Lifecycle

```text
User

↓

Next.js Page

↓

Route Handler

↓

Validation

↓

Application Service

↓

Repository

↓

Database

↓

Service

↓

Response

↓

UI Update
```

---

# 7. Interview Lifecycle

```text
Login

↓

Create Session

↓

Interview Configuration

↓

Realtime Conversation

↓

Transcript

↓

Evaluation

↓

Feedback

↓

Report

↓

Dashboard
```

---

# 8. AI Conversation Flow

```text
Microphone

↓

Realtime Audio

↓

OpenAI Realtime

↓

Conversation Manager

↓

Interview State

↓

Response

↓

Voice Output
```

The conversation manager owns interview context rather than allowing the AI provider to dictate application state.

---

# 9. Design Principles

Single Responsibility

Dependency Inversion

Feature Isolation

Reusable Components

Server-first Rendering

Strong Typing

Minimal Global State

Progressive Enhancement

---

# 10. Scalability

The architecture allows future support for:

- Multiple AI providers
- Coding interviews
- Resume analysis
- Recruiter dashboard
- Enterprise workspaces
- Multi-language interviews

without major refactoring.

---

# 11. Risks

Third-party AI dependency

Network latency

Realtime audio reliability

Browser permissions

Token usage

Mitigation strategies are documented in AI_ENGINE.md.

---

# 12. Related Documents

TECHSTACK.md

DATABASE.md

AI_ENGINE.md

API.

# System Architecture

**Product:** InterviewPilot AI
**Document:** System Architecture
**Version:** 1.0
**Status:** Draft
**Owner:** Niranjan Sah

---

# 1. Purpose

This document defines the high-level architecture of InterviewPilot AI, including system boundaries, architectural principles, major components, communication patterns, and design decisions.

The objective is to establish a scalable, maintainable, and production-ready architecture that supports real-time AI-powered interview experiences while remaining modular enough for future expansion.

---

# 2. Architecture Goals

The architecture has been designed around the following principles:

- Modular
- Scalable
- Maintainable
- Secure
- AI-first
- Cloud-ready
- Observable
- Testable

The system should support rapid feature development without tightly coupling business logic to infrastructure or third-party providers.

---

# 3. High-Level Architecture

```text
                        Browser

                           │

                    Next.js Frontend

                           │

              Route Handlers / Server Actions

                           │

                 Application Service Layer

                           │

                 Domain / Business Logic

                           │

          Repository Layer / Data Access Layer

                           │

                 Prisma ORM

                           │

                    PostgreSQL

                           │

──────────────────────────────────────────────

              External Infrastructure

OpenAI Realtime API

Authentication

File Storage

Future AI Providers

Logging

Monitoring
```

---

# 4. Layered Architecture

InterviewPilot AI follows a layered architecture.

## Presentation Layer

Responsibilities

- UI
- Forms
- Authentication screens
- Dashboard
- Interview pages
- Reports

Rules

Presentation components never directly access the database.

---

## Application Layer

Responsibilities

- Coordinate business workflows
- Validation
- Session management
- Authentication
- AI orchestration

Application services communicate with repositories instead of directly accessing Prisma.

---

## Domain Layer

Contains:

- Interview Engine
- Evaluation Logic
- Feedback Generation
- Conversation State

Business rules remain independent of framework implementation.

---

## Infrastructure Layer

Contains:

- Prisma
- OpenAI Provider
- JWT
- External APIs

This layer can be replaced without changing business logic.

---

# 5. Core Modules

The application consists of the following primary modules:

Authentication

Dashboard

Interview Engine

AI Provider

Transcript Management

Feedback Engine

Reporting

Shared UI

Infrastructure

---

# 6. Request Lifecycle

```text
User

↓

Next.js Page

↓

Route Handler

↓

Validation

↓

Application Service

↓

Repository

↓

Database

↓

Service

↓

Response

↓

UI Update
```

---

# 7. Interview Lifecycle

```text
Login

↓

Create Session

↓

Interview Configuration

↓

Realtime Conversation

↓

Transcript

↓

Evaluation

↓

Feedback

↓

Report

↓

Dashboard
```

---

# 8. AI Conversation Flow

```text
Microphone

↓

Realtime Audio

↓

OpenAI Realtime

↓

Conversation Manager

↓

Interview State

↓

Response

↓

Voice Output
```

The conversation manager owns interview context rather than allowing the AI provider to dictate application state.

---

# 9. Design Principles

Single Responsibility

Dependency Inversion

Feature Isolation

Reusable Components

Server-first Rendering

Strong Typing

Minimal Global State

Progressive Enhancement

---

# 10. Scalability

The architecture allows future support for:

- Multiple AI providers
- Coding interviews
- Resume analysis
- Recruiter dashboard
- Enterprise workspaces
- Multi-language interviews

without major refactoring.

---

# 11. Risks

Third-party AI dependency

Network latency

Realtime audio reliability

Browser permissions

Token usage

Mitigation strategies are documented in AI_ENGINE.md.

---

# 12. Related Documents

TECHSTACK.md

DATABASE.md

AI_ENGINE.md

API.md

# System Architecture

**Product:** InterviewPilot AI
**Document:** System Architecture
**Version:** 1.0
**Status:** Draft
**Owner:** Niranjan Sah

---

# 1. Purpose

This document defines the high-level architecture of InterviewPilot AI, including system boundaries, architectural principles, major components, communication patterns, and design decisions.

The objective is to establish a scalable, maintainable, and production-ready architecture that supports real-time AI-powered interview experiences while remaining modular enough for future expansion.

---

# 2. Architecture Goals

The architecture has been designed around the following principles:

- Modular
- Scalable
- Maintainable
- Secure
- AI-first
- Cloud-ready
- Observable
- Testable

The system should support rapid feature development without tightly coupling business logic to infrastructure or third-party providers.

---

# 3. High-Level Architecture

```text
                        Browser

                           │

                    Next.js Frontend

                           │

              Route Handlers / Server Actions

                           │

                 Application Service Layer

                           │

                 Domain / Business Logic

                           │

          Repository Layer / Data Access Layer

                           │

                 Prisma ORM

                           │

                    PostgreSQL

                           │

──────────────────────────────────────────────

              External Infrastructure

OpenAI Realtime API

Authentication

File Storage

Future AI Providers

Logging

Monitoring
```

---

# 4. Layered Architecture

InterviewPilot AI follows a layered architecture.

## Presentation Layer

Responsibilities

- UI
- Forms
- Authentication screens
- Dashboard
- Interview pages
- Reports

Rules

Presentation components never directly access the database.

---

## Application Layer

Responsibilities

- Coordinate business workflows
- Validation
- Session management
- Authentication
- AI orchestration

Application services communicate with repositories instead of directly accessing Prisma.

---

## Domain Layer

Contains:

- Interview Engine
- Evaluation Logic
- Feedback Generation
- Conversation State

Business rules remain independent of framework implementation.

---

## Infrastructure Layer

Contains:

- Prisma
- OpenAI Provider
- JWT
- External APIs

This layer can be replaced without changing business logic.

---

# 5. Core Modules

The application consists of the following primary modules:

Authentication

Dashboard

Interview Engine

AI Provider

Transcript Management

Feedback Engine

Reporting

Shared UI

Infrastructure

---

# 6. Request Lifecycle

```text
User

↓

Next.js Page

↓

Route Handler

↓

Validation

↓

Application Service

↓

Repository

↓

Database

↓

Service

↓

Response

↓

UI Update
```

---

# 7. Interview Lifecycle

```text
Login

↓

Create Session

↓

Interview Configuration

↓

Realtime Conversation

↓

Transcript

↓

Evaluation

↓

Feedback

↓

Report

↓

Dashboard
```

---

# 8. AI Conversation Flow

```text
Microphone

↓

Realtime Audio

↓

OpenAI Realtime

↓

Conversation Manager

↓

Interview State

↓

Response

↓

Voice Output
```

The conversation manager owns interview context rather than allowing the AI provider to dictate application state.

---

# 9. Design Principles

Single Responsibility

Dependency Inversion

Feature Isolation

Reusable Components

Server-first Rendering

Strong Typing

Minimal Global State

Progressive Enhancement

---

# 10. Scalability

The architecture allows future support for:

- Multiple AI providers
- Coding interviews
- Resume analysis
- Recruiter dashboard
- Enterprise workspaces
- Multi-language interviews

without major refactoring.

---

# 11. Risks

Third-party AI dependency

Network latency

Realtime audio reliability

Browser permissions

Token usage

Mitigation strategies are documented in AI_ENGINE.md.

---

# 12. Related Documents

TECHSTACK.md

DATABASE.md

AI_ENGINE.md

API.md