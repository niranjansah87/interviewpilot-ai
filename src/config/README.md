# Config

Application configuration. All runtime config is validated at startup using Zod.

## Rules

- Never access `process.env` directly outside `config/`
- Every env variable has a corresponding Zod-validated constant
- Configuration is tree-shakeable via explicit exports

## Files

```
config/
├── app.config.ts      # App-wide config (name, URLs, etc.)
├── auth.config.ts    # Auth config (JWT expiry, etc.)
├── ai.config.ts      # AI provider config
└── env.config.ts     # Zod schema for all env vars
```
