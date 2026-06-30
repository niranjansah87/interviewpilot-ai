# Architecture Diagrams

> Generated from actual codebase — every diagram reflects the implementation.

## Diagram Index

| # | Diagram | Description | Present in Loom |
|---|---------|-------------|:---:|
| 1 | [System Architecture](01-system-architecture.md) | Full-stack architecture: browser → API → services → engine → AI → database | ✅ |
| 2 | [Voice Pipeline](02-voice-pipeline.md) | Web Audio runtime, ElevenLabs WebSocket, barge-in, waveform | ✅ |
| 3 | [Interview Lifecycle](03-interview-lifecycle.md) | State machine: idle → connecting → listening → speaking → completed | ✅ |
| 4 | [End-to-End Flow](04-end-to-end-flow.md) | Sequence diagram: login → interview → feedback → report | ✅ |
| 5 | [Database Schema](05-database-schema.md) | ER diagram with all models, indexes, and caching strategy | |
| 6 | [Auth Flow](06-auth-flow.md) | JWT, bcrypt, refresh rotation, CSRF, rate limiting | |
| 7 | [Provider Architecture](07-provider-architecture.md) | AIProvider interface, ElevenLabs/OpenAI adapters, fallback chain | |

## Suggested Loom Presentation Order

1. **System Architecture** — 2 min overview of the full stack
2. **Voice Pipeline** — 2 min deep dive into audio + WebSocket
3. **End-to-End Flow** — 3 min walkthrough of the complete interview lifecycle
4. **Interview Lifecycle** — 1 min state machine overview
5. **Provider Architecture** — 1 min on provider abstraction

## How to Export

Mermaid diagrams in these `.md` files render natively on GitHub. To export as SVG/PNG:

```bash
# Using mermaid-cli
npx @mermaid-js/mermaid-cli -i 01-system-architecture.md -o 01-system-architecture.png

# Or paste into https://mermaid.live for interactive export
```
