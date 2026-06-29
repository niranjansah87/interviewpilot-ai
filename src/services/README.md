# Services

Business logic layer. Services orchestrate domain operations, call repositories, and implement business rules.

## Rules

- Services never import from `app/` (route handlers)
- Services access the database through repositories only
- Services are pure TypeScript — no React dependencies
- One service per domain concern
- Public functions are named clearly: `createInterviewSession`, not `create`
- Validate inputs with Zod schemas defined in `services/` or `lib/validators/`

## Naming

```
services/
├── auth.service.ts
├── interview.service.ts
├── feedback.service.ts
├── transcript.service.ts
└── user.service.ts
```
