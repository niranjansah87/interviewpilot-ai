# Constants

Application-wide constants.

## Rules

- Use `UPPER_SNAKE_CASE` naming
- Group related constants in named objects
- Never hardcode magic numbers — extract to constants
- Constants should be simple values (strings, numbers) — not objects or functions

## Examples

```typescript
export const INTERVIEW_MAX_DURATION_SECONDS = 30 * 60;
export const TRANSCRIPT_CHUNK_SIZE_MS = 100;
export const API_RATE_LIMIT_PER_MINUTE = 100;
```
