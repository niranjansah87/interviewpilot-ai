# Events

Domain events for decoupling parts of the application.

## Rules

- Events represent something that happened in the past (past tense names)
- Use a simple typed event emitter — avoid heavy event bus libraries initially
- Event handlers are fire-and-forget — don't block the main flow
- Define events in `types/` and handlers in `services/`

## Examples

```typescript
// Event types
export type DomainEvent =
  | { type: 'INTERVIEW_STARTED'; payload: { sessionId: string; userId: string } }
  | { type: 'INTERVIEW_COMPLETED'; payload: { sessionId: string; duration: number } }
  | { type: 'FEEDBACK_GENERATED'; payload: { sessionId: string; reportId: string } };
```
