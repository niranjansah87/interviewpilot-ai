# Validators

Zod schemas for runtime validation of API inputs, environment variables, and external data.

## Rules

- Use Zod for all runtime validation
- Define schemas as named exports
- Use `z.infer<>` to derive TypeScript types from schemas
- Co-locate validators with the features they serve; put shared ones here

## Examples

```typescript
import { z } from 'zod';

export const CreateInterviewSchema = z.object({
  type: z.enum(['behavioral', 'technical', 'mixed']),
  targetRole: z.string().min(1).max(200),
  experienceLevel: z.enum(['junior', 'mid', 'senior']),
});

export type CreateInterviewInput = z.infer<typeof CreateInterviewSchema>;
```
