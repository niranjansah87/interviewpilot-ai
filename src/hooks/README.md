# Hooks

Custom React hooks shared across features.

## Rules

- Prefix all hooks with `use`: `useAuth`, `useInterview`, `useQueryUtils`
- One hook per file; filename matches hook name
- Keep hooks small and focused — extract logic into services if complex
- Custom hooks that wrap external libraries belong here (not in `lib/`)
- Hooks should return objects, not arrays, for easier future extension
