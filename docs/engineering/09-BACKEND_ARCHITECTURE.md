
# Backend Architecture

**Project:** InterviewPilot AI

**Document:** Backend Architecture

**Version:** 1.0

**Status:** Draft

**Owner:** Niranjan Sah

---

# 1. Purpose

The backend architecture of InterviewPilot AI is designed to support low-latency, real-time AI conversations while maintaining a clean separation between business logic, infrastructure, and AI orchestration.

Unlike traditional CRUD applications, the backend primarily coordinates:

* authentication
* interview lifecycle
* conversation state
* AI orchestration
* transcript persistence
* evaluation
* analytics

The backend intentionally treats the LLM as one service within a deterministic application rather than the application's source of truth.

---

# 2. Architecture Goals

The backend is designed around the following principles.

## Modular

Every feature should remain independently maintainable.

---

## Stateless

Business requests should remain stateless wherever practical.

Persistent state belongs inside PostgreSQL.

---

## Provider Independent

The application should never depend directly on a specific LLM provider.

---

## Observable

Every request should be traceable.

---

## Recoverable

Unexpected failures should preserve interview progress.

---

## Scalable

Future services should be extracted without architectural redesign.

---

# 3. High-Level Architecture

```text
Browser

↓

Next.js Route Handlers

↓

Middleware

↓

Controllers

↓

Services

↓

Conversation Engine

↓

AI Runtime

↓

Provider Adapter

↓

OpenAI Realtime API

↓

Database
```

Every layer owns one responsibility.

---

# 4. Backend Layers

The backend is divided into logical layers.

## API Layer

Responsibilities:

* request validation
* authentication
* routing
* response formatting

No business logic should exist here.

---

## Service Layer

Contains application business logic.

Examples:

* interview creation
* report generation
* authentication
* transcript persistence

---

## Conversation Engine

Owns:

* interview state
* topic progression
* follow-up decisions
* prompt compilation

This layer controls interview behavior.

---

## AI Runtime

Responsible for:

* prompt generation
* provider communication
* response validation
* structured outputs

---

## Data Layer

Responsible for:

* persistence
* transactions
* repository abstraction

---

# 5. Request Lifecycle

Every request follows a deterministic pipeline.

```text
Client Request

↓

Middleware

↓

Authentication

↓

Validation

↓

Route Handler

↓

Service

↓

Conversation Engine

↓

AI Runtime

↓

Database

↓

Response
```

Errors are handled centrally.

---

# 6. Feature Organization

```text
src/

server/

api/

controllers/

services/

repositories/

conversation/

ai/

auth/

middleware/

database/

validators/

events/

jobs/

utils/
```

Every directory represents a business capability.

---

# 7. API Design Principles

The backend follows REST principles for application APIs.

Realtime communication uses streaming endpoints.

API characteristics:

* predictable
* versioned
* typed
* validated
* documented

---

# 8. Authentication

Authentication uses JWT.

Flow:

```text
Login

↓

JWT

↓

HTTP Only Cookie

↓

Middleware Validation

↓

Authorized Request
```

Authorization remains role-based in future versions.

---

# 9. Validation

Every incoming request is validated before execution.

Validation covers:

* request body
* query parameters
* path parameters
* headers

Zod schemas serve as the single source of truth.

---

# 10. Error Handling

Errors are categorized.

Client Errors

* validation
* authentication
* authorization

Application Errors

* business rules
* interview state

Infrastructure Errors

* database
* network
* provider failures

AI Errors

* malformed responses
* timeout
* token exhaustion

Each category has standardized error responses.

---

# 11. Repository Pattern

Database access is isolated.

```text
Service

↓

Repository

↓

Prisma

↓

PostgreSQL
```

Services never execute SQL directly.

---

# 12. Dependency Flow

Allowed:

```text
Route

↓

Service

↓

Repository
```

Forbidden:

```text
Repository

↓

Service
```

Dependencies always move downward.

---

# 13. Event-Driven Components

Certain operations execute asynchronously.

Examples:

* report generation
* analytics
* evaluation
* activity logging

Future versions may introduce background workers.

---

# 14. Configuration

Configuration originates from environment variables.

Examples:

* OpenAI keys
* database URL
* JWT secret
* logging
* feature flags

Application configuration remains centralized.

---

# 15. Security Principles

The backend enforces:

* HTTPS
* secure cookies
* input validation
* rate limiting
* least privilege
* output sanitization

Security is applied by default rather than per feature.

---

# 16. Scalability Strategy

Current architecture supports a modular monolith.

Future extraction candidates:

* AI Runtime
* Evaluation Engine
* Analytics
* Notifications
* Voice Processing

Extraction should require minimal code changes.

---

# 17. Logging

Every request generates structured logs.

Captured metadata includes:

* request ID
* user ID
* interview ID
* latency
* endpoint
* provider
* status code

Sensitive information is never logged.

---

# 18. Monitoring

Operational metrics include:

* API latency
* interview duration
* AI response time
* provider failures
* database performance
* error rates

Metrics support proactive monitoring.

---

# 19. Engineering Standards

Every backend module should:

* remain testable
* avoid hidden dependencies
* expose typed interfaces
* document public APIs
* fail predictably

Business logic should remain independent of infrastructure.

---

# 20. Future Evolution

Planned enhancements include:

* Redis caching
* Event queues
* Worker processes
* Multi-provider AI routing
* Horizontal scaling
* Kubernetes deployment
* Distributed tracing
* WebSocket gateway

The architecture intentionally supports incremental evolution.

---

# Related Documents

* ARCHITECTURE.md
* API.md
* DATABASE.md
* LLM_ARCHITECTURE.md
* CONVERSATION_ENGINE.md
* STATE_MANAGEMENT.md
* DEPLOYMENT.md
* OBSERVABILITY.md

