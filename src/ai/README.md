# AI

AI provider adapters and LLM utilities.

## Structure

```
ai/
├── provider.ts     # Provider interface (abstraction layer)
├── openai.ts      # OpenAI implementation
└── prompts/       # Prompt templates
```

## Rules

- All AI provider logic lives behind the `AIProvider` interface
- Switching providers requires only implementing a new adapter
- Prompt templates are versioned and validated
- Token usage is tracked per request

## Placeholder

AI provider abstraction is implemented in Phase 2.
