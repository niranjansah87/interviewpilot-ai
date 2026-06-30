# Testing

**Product:** InterviewPilot AI
**Document:** Testing Strategy
**Version:** 1.0
**Status:** Draft
**Owner:** Niranjan Sah

---

## 1. Philosophy

Tests provide confidence to ship. They catch regressions, document behavior, and enable refactoring. The testing strategy prioritizes:

- **Critical paths are tested thoroughly** — auth, interview flow, feedback generation
- **Unit tests for logic** — pure functions, services, business rules
- **Integration tests for data flows** — API endpoints, database queries
- **E2E tests for key journeys** — happy paths for registration, interview, report

We do not pursue 100% coverage as a vanity metric. Coverage is a guide, not a goal.

---

## 2. Test Types

### Unit Tests

Test individual functions and modules in isolation, mocking all dependencies.

**Tools:** Vitest + React Testing Library (frontend), Vitest (unit + integration)

**Coverage target:** Business logic, utility functions, prompt builders

### Integration Tests

Test the interaction between components — typically API routes against a test database.

**Tools:** Supertest (API), Prisma test client

**Coverage target:** API endpoints, auth flows, database operations

### End-to-End Tests

Test complete user journeys in a real browser.

**Tools:** Playwright

**Coverage target:** Registration, login, start interview, complete interview, view report

---

## 3. Test Coverage Targets

| Layer | Target | Enforcement |
|-------|--------|-------------|
| API route handlers | 80%+ | CI gate |
| Services / business logic | 80%+ | CI gate |
| UI components (critical) | 70%+ | CI gate |
| E2E (key journeys) | 100% of defined flows | Manual per-release |

---

## 4. Critical Paths

These user journeys must always pass in CI before release:

| # | Journey | Test Type | Priority |
|---|---------|-----------|---------|
| 1 | Register new account | E2E | Critical |
| 2 | Login with valid credentials | E2E | Critical |
| 3 | Login with invalid credentials | Unit | High |
| 4 | Start an interview session | Integration | Critical |
| 5 | Complete an interview (mock AI) | Integration | Critical |
| 6 | View feedback report | E2E | Critical |
| 7 | View interview history | Integration | High |
| 8 | JWT token refresh | Integration | High |
| 9 | Unauthorized access to protected route | Integration | High |

---

## 5. Test Structure

```
src/
├── __tests__/
│   ├── unit/
│   │   ├── lib/
│   │   ├── services/
│   │   └── utils/
│   ├── integration/
│   │   ├── api/
│   │   └── db/
│   └── e2e/
│       ├── auth.spec.ts
│       ├── interview.spec.ts
│       └── report.spec.ts

prisma/
└── __tests__/
    └── migrations.spec.ts
```

**Naming conventions:**
- Unit tests: `*.test.ts` or `*.spec.ts`
- Integration tests: `*.integration.test.ts`
- E2E tests: `*.e2e.spec.ts`

---

## 6. Mocking Strategy

| Dependency | Strategy |
|------------|---------|
| OpenAI API | Mock at the service layer; use recorded responses for regression tests |
| Database | Use a test database (separate schema or Supabase test project) |
| WebRTC | Mock `MediaRecorder` and `RTCPeerConnection` in unit tests |
| Time | Use `vi.useFakeTimers()` (Vitest) for testing time-dependent logic |
| Auth | Use signed test JWTs with known expiry |

---

## 7. CI Integration

Tests run on every pull request. The CI gate:

1. `npm run typecheck`
2. `npm run lint`
3. `npm run test`
4. `npm run build`

**The PR merge is blocked if any step fails.**

Coverage reports are uploaded to Codecov on every CI run (when on `main`).

---

## 8. Testing Data

- **Test database:** Separate Supabase project with a `test-` prefixed schema
- **Seed data:** Minimal — a test user + a few sessions are created in `beforeAll` hooks
- **Factories:** Use factory functions (not fixtures) to generate test data with required fields

---

## 9. Playwright E2E Setup

```typescript
// playwright.config.ts
export default {
  testDir: './src/__tests__/e2e',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
};
```

E2E tests run against a local dev server started in CI via `npm run dev &`.

---

## 10. Related Documents

- [11-CODING_STANDARDS.md](11-CODING_STANDARDS.md)
- [.github/workflows/ci.yml](../.github/workflows/ci.yml)
