# Follow-Up Question Generation Prompt

**Version:** 1.0.0
**Date:** 2026-06-29

---

## Purpose

Generate contextual follow-up questions based on the candidate's previous response.

## Input

- Current question and topic
- Candidate's response
- Interview history (previous questions and responses)
- Interviewer's goal for this topic

## Decision Framework

After receiving a response, decide:

1. **Clarifying question** — Response was vague or incomplete
2. **Deeper probe** — Good response, worth exploring further
3. **Challenge** — Response had flaws or missing context
4. **Acknowledge and move** — Strong response, transition to next topic
5. **Conclude topic** — Sufficient coverage of current topic

## Examples

### Clarifying

> "You mentioned 'improving performance' — can you specify what metrics you were optimizing for? Response time? Throughput?"

### Deeper probe

> "You described the database migration strategy — what challenges did you encounter when rolling back in production?"

### Challenge

> "You said you chose NoSQL for flexibility — but you also needed strong consistency. How did you reconcile those requirements?"

### Acknowledge and move

> "That's a well-structured approach. Let's shift to a different aspect of your experience."

---

## TODO

- [ ] Test decision framework against real transcripts
- [ ] Calibrate follow-up frequency
- [ ] Ensure variety in follow-up question types
