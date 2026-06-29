# API

**Product:** InterviewPilot AI
**Document:** API Specification
**Version:** 1.0
**Status:** Draft
**Owner:** Niranjan Sah

---

## 1. Overview

The InterviewPilot AI API is a REST API built on Next.js Route Handlers. It provides endpoints for authentication, interview session management, transcript retrieval, and feedback reports.

All API endpoints follow REST conventions and return JSON.

---

## 2. Base URL

```
Development:  http://localhost:3000/api
Staging:      https://staging.interviewpilot.ai/api
Production:   https://api.interviewpilot.ai
```

---

## 3. Authentication

### Bearer Token

All protected endpoints require an access token:

```
Authorization: Bearer <access_token>
```

Tokens are short-lived (15 minutes) and delivered via httpOnly cookies during login. The client reads them via `credentials: 'include'` on fetch calls.

### Public Endpoints

| Method | Path | Auth Required |
|--------|------|---------------|
| POST | /api/auth/register | No |
| POST | /api/auth/login | No |
| POST | /api/auth/refresh | Refresh token only |
| GET | /api/health | No |

---

## 4. Endpoints

### Authentication

#### `POST /api/auth/register`

Create a new user account.

**Request Body**

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Responses**

| Status | Meaning |
|--------|---------|
| 201 | User created successfully |
| 409 | Email already registered |
| 422 | Validation error |

**Response (201)**

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "createdAt": "2026-06-29T00:00:00Z"
}
```

---

#### `POST /api/auth/login`

Authenticate and receive tokens.

**Request Body**

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200)**

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "tokenType": "Bearer"
}
```

Tokens are set as httpOnly cookies. The response body does not include the token value.

---

#### `POST /api/auth/logout`

Invalidate the current session.

**Response (200)**

```json
{
  "message": "Logged out successfully"
}
```

---

#### `POST /api/auth/refresh`

Exchange a valid refresh token for a new access token.

**Response (200)**

```json
{
  "user": { "id": "uuid", "email": "user@example.com" }
}
```

---

### Users

#### `GET /api/users/me`

Get the authenticated user's profile.

**Response (200)**

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "createdAt": "2026-06-29T00:00:00Z"
}
```

---

#### `PATCH /api/users/me`

Update the authenticated user's profile.

**Request Body** (all fields optional)

```json
{
  "name": "Jane Doe"
}
```

---

### Interview Sessions

#### `POST /api/interviews`

Create a new interview session.

**Request Body**

```json
{
  "type": "behavioral",
  "targetRole": "software_engineer",
  "experienceLevel": "mid"
}
```

**Response (201)**

```json
{
  "id": "uuid",
  "type": "behavioral",
  "targetRole": "software_engineer",
  "experienceLevel": "mid",
  "status": "ready",
  "createdAt": "2026-06-29T00:00:00Z"
}
```

---

#### `GET /api/interviews`

List the authenticated user's interview sessions.

**Query Parameters**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 10 | Items per page |
| status | string | — | Filter by status |

**Response (200)**

```json
{
  "data": [
    {
      "id": "uuid",
      "type": "behavioral",
      "targetRole": "software_engineer",
      "experienceLevel": "mid",
      "status": "completed",
      "durationSeconds": 1320,
      "createdAt": "2026-06-29T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

---

#### `GET /api/interviews/:id`

Get a single interview session.

**Response (200)**

```json
{
  "id": "uuid",
  "type": "behavioral",
  "targetRole": "software_engineer",
  "experienceLevel": "mid",
  "status": "completed",
  "durationSeconds": 1320,
  "startedAt": "2026-06-29T00:10:00Z",
  "endedAt": "2026-06-29T00:32:00Z",
  "createdAt": "2026-06-29T00:00:00Z"
}
```

---

#### `DELETE /api/interviews/:id`

Delete an interview session and all associated data.

**Response (204)** — No body.

---

### Transcripts

#### `GET /api/interviews/:id/transcript`

Get the full transcript for an interview session.

**Response (200)**

```json
{
  "sessionId": "uuid",
  "entries": [
    {
      "id": "uuid",
      "role": "interviewer",
      "content": "Tell me about a challenging project you've worked on.",
      "createdAt": "2026-06-29T00:10:05Z"
    },
    {
      "id": "uuid",
      "role": "candidate",
      "content": "Sure, I'd like to share an experience from my work at...",
      "createdAt": "2026-06-29T00:10:12Z"
    }
  ]
}
```

---

### Feedback Reports

#### `GET /api/interviews/:id/report`

Get the feedback report for an interview session.

**Response (200)**

```json
{
  "sessionId": "uuid",
  "overallScore": 78,
  "communicationScore": 82,
  "confidenceScore": 71,
  "technicalReasoning": 80,
  "strengths": [
    "Clear communication of technical concepts",
    "Good use of specific examples from past experience"
  ],
  "weaknesses": [
    "Tended to rush through the explanation of technical decisions",
    "Did not address trade-offs in the solution"
  ],
  "improvements": [
    "Practice articulating trade-offs in system design decisions",
    "Slow down when explaining complex technical topics"
  ],
  "summary": "A solid performance demonstrating good technical...",
  "createdAt": "2026-06-29T00:35:00Z"
}
```

---

## 5. Error Responses

All errors follow a consistent format:

```json
{
  "detail": "Human-readable error message",
  "code": "ERROR_CODE"
}
```

### Standard Error Codes

| HTTP Status | Code | Meaning |
|-------------|------|---------|
| 400 | BAD_REQUEST | Malformed request |
| 401 | UNAUTHORIZED | Missing or invalid token |
| 403 | FORBIDDEN | Token valid but insufficient permissions |
| 404 | NOT_FOUND | Resource does not exist |
| 409 | CONFLICT | Resource already exists |
| 422 | VALIDATION_ERROR | Request failed validation |
| 429 | RATE_LIMITED | Too many requests |
| 500 | INTERNAL_ERROR | Unexpected server error |

---

## 6. Rate Limiting

| Endpoint Group | Limit |
|---------------|-------|
| Auth endpoints | 10 requests / 15 minutes / IP |
| General API | 100 requests / 1 minute / user |

Rate limit headers are returned on all responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1751234567
```

---

## 7. Versioning

The API is versioned via the URL path (`/api/v1/`). The current version is implied by the absence of a version prefix and is considered v1.

Future versions will be prefixed: `/api/v2/`, `/api/v3/`, etc.

---

## 8. Related Documents

- [07-SECURITY.md](07-SECURITY.md)
- [14-ERROR_HANDLING.md](14-ERROR_HANDLING.md)
- [docs/decisions/0005-jwt-auth.md](../decisions/0005-jwt-auth.md)
