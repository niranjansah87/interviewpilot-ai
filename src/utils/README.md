# Utils

Pure utility functions. These should have no side effects.

## Rules

- Every function is pure (same input → same output, no mutations)
- No imports from `services/`, `stores/`, or `providers/`
- Tree-shakeable — export each function individually
- Document complex logic with JSDoc

## Examples

```typescript
// Good
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Bad — side effect
export function logAndReturn<T>(value: T, message: string): T {
  console.log(message); // Side effect — belongs in a logger
  return value;
}
```
