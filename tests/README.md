# Tests

```
tests/
├── unit/           # Unit tests (Vitest)
├── integration/    # Integration tests
├── e2e/           # End-to-end tests (Playwright)
├── fixtures/      # Shared test fixtures
└── mocks/         # Shared mocks and stubs
```

## Tooling

| Type | Tool |
|------|------|
| Unit + Integration | Vitest |
| Component | React Testing Library |
| E2E | Playwright |
| API integration | Supertest (or fetch) |

## Rules

- Tests live next to the code they test (`*.test.ts` next to `*.ts`)
- E2E tests live in `tests/e2e/` and test complete user journeys
- Use factories (not fixtures) for test data
- Mock external services (OpenAI, Supabase) at the adapter layer
- Every PR must pass all tests; CI blocks merges on failure

## Running Tests

```bash
npm test              # Run all tests
npm run test:unit     # Unit tests only
npm run test:watch    # Watch mode
npm run test:e2e      # Playwright E2E tests
```
