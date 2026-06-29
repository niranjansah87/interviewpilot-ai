# Security

Security utilities, guards, and helpers.

## Contents

- CSRF token generation and validation
- Rate limiting utilities
- Input sanitization helpers
- Security header helpers
- Secret hashing utilities

## Rules

- Never implement custom crypto — use Node.js `crypto` module or battle-tested libraries
- Security utilities are used by services and middleware, not the other way around
