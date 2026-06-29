# ADR-0002: OpenAI Realtime API for Voice

**Status:** Accepted
**Date:** 2026-06-21
**Deciders:** Niranjan Sah

---

## Context

InterviewPilot AI requires low-latency voice conversation between the candidate and the AI interviewer. The candidate speaks, the AI processes, and the AI responds — all in near real-time.

We evaluated the OpenAI Realtime API (beta), Web Speech API + GPT-4, and a custom voice pipeline using Whisper + GPT-4.

## Decision

**Use the OpenAI Realtime API** as the primary voice interaction engine.

## Rationale

### Why OpenAI Realtime API

- **Native voice-to-voice** — The API handles speech-to-text, language model inference, and text-to-speech in a single streaming session. No custom voice pipeline needed.
- **Low latency** — Built for real-time use cases. The beta demonstrated sub-2-second round-trip times acceptable for conversational interviews.
- **GPT-4 integration** — Conversational context is maintained natively. Follow-up questions, contradictions, and adaptive behavior emerge naturally from the model without custom orchestration.
- **Managed infrastructure** — No voice servers to operate. Reduces operational complexity significantly.
- **Single provider** — Authentication, billing, and integration are unified with GPT-4 for feedback generation.

### Why Not Alternatives

- **Web Speech API + GPT-4** — Web Speech API has inconsistent browser support, limited voice quality, and no native streaming. Building a robust voice pipeline would be a significant engineering investment better spent on the interview experience itself.
- **Whisper + GPT-4 + TTS pipeline** — Technically feasible, but introduces three distinct services to orchestrate, each with its own latency profile. The complexity of managing a custom pipeline outweighs the benefits for an MVP.

## Consequences

### Positive

- Single integration point for voice AI
- Natural conversational AI without custom orchestration
- Fastest path from zero to voice interview
- Built-in voice activity detection and turn detection

### Negative

- **Vendor lock-in** — Switching voice providers requires re-engineering the core interaction layer.
- **Cost** — Realtime API pricing is per token + per audio minute. At scale, costs will be significant. Monitoring and budgets are essential.
- **Feature constraints** — We are limited to features the Realtime API exposes. Custom voice activity logic or personalization is constrained.
- **Reliability dependency** — If the OpenAI Realtime API experiences outages, interviews cannot proceed.

## Notes

- The AI Engine is designed with an **AI Provider abstraction** to isolate vendor-specific logic. Switching providers (e.g., to Azure OpenAI Realtime or Anthropic) should only require implementing a new provider adapter.
- Costs are tracked per interview session. Feedback reports and session metadata include token usage for transparency.
- Fallback behavior (e.g., degrading to text-only mode) is documented in the [AI Engine](../engineering/04-AI_ENGINE.md) design.
