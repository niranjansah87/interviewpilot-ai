# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

<!--
Types: Added, Changed, Deprecated, Removed, Fixed, Security
-->

## [Unreleased]

### Added

- Comprehensive project documentation structure
- Architecture Decision Records (ADRs) for major technical choices
- Mermaid diagrams for authentication, deployment, interview engine, and voice flows
- GitHub CI/CD workflows
- GitHub community files (CODEOWNERS, CODE_OF_CONDUCT, SUPPORT)
- Pull request and issue templates

### Engineering Docs Added

- `01-ARCHITECTURE.md` — System architecture overview
- `02-TECHSTACK.md` — Technology choices and rationale
- `03-DATABASE.md` — Database schema and design
- `04-AI_ENGINE.md` — AI interview engine architecture
- `05-API.md` — REST API specification
- `06-DESIGN_SYSTEM.md` — Visual design language
- `06-PROMPT_ENGINEERING.md` — Prompt design strategy
- `07-SECURITY.md` — Security requirements
- `08-DEPLOYMENT.md` — Deployment and CI/CD guide
- `09-PERFORMANCE.md` — Performance targets
- `10-TESTING.md` — Testing strategy
- `11-CODING_STANDARDS.md` — Code conventions
- `12-OBSERVABILITY.md` — Logging, metrics, alerting
- `13-FOLDER_STRUCTURE.md` — Project layout
- `14-ERROR_HANDLING.md` — Error strategy
- `15-DECISIONS.md` — ADR index
- `UI_ARCHITECTURE.md` — UI component architecture
- `UX_CASE_STUDY.md` — UX decision rationale

### Product Docs Added

- `01-product-overview.md` — Product introduction
- `02-problem-statement.md` — Problem definition
- `03-goals-and-non-goals.md` — Scope boundaries
- `04-user-personas.md` — User profiles
- `05-user-journeys.md` — User flows
- `06-functional-requirements.md` — Feature requirements
- `07-non-functional-requirements.md` — Quality attributes
- `08-success-metrics.md` — Measurable outcomes
- `09-mvp-scope.md` — MVP definition
- `10-future-roadmap.md` — Post-MVP vision
- `11-edge-cases.md` — Edge case handling
- `12-release-plan.md` — Release strategy

---

## [1.0.0] — MVP Release

### Added

- User authentication (email + password, JWT)
- Dashboard with interview history
- Voice interview with OpenAI Realtime API
- Adaptive AI interviewer (follow-up questions, context awareness)
- AI-generated feedback reports
- Interview transcript viewer
- Responsive web interface
- Prisma ORM with PostgreSQL
- Next.js 15 with App Router
- TypeScript throughout

### Security

- bcrypt password hashing
- JWT access + refresh token strategy
- httpOnly cookie transport
- CSRF protection
- Rate limiting on auth endpoints
- Input validation with Zod

---

## [0.1.0] — Initial Setup

### Added

- Project scaffolding
- Next.js 15 with TypeScript
- TailwindCSS + shadcn/ui
- Prisma schema (initial)
- Environment configuration
- README and LICENSE

---

<!--
Release line format:
## [MAJOR.MINOR.PATCH] — YYYY-MM-DD

Types:
- Added     — new features
- Changed   — changes in existing functionality
- Deprecated — soon-to-be removed features
- Removed   — features now removed
- Fixed     — bug fixes
- Security  — vulnerability fixes
-->
