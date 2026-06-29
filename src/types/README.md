# Types

Shared TypeScript types and interfaces that span multiple features.

## Rules

- Define types close to where they are used (prefer `features/<name>/types/`)
- Only use `types/` for truly cross-cutting types
- Use `interface` for object shapes; use `type` for unions and aliases
- Avoid `any` — use `unknown` and narrow with type guards

## Examples

```typescript
// Good
interface User {
  id: string;
  email: string;
}
type InterviewStatus = 'ready' | 'active' | 'completed' | 'failed';

// Avoid
type Anything = any;
```
