# Conversation Engine

**Product:** InterviewPilot AI

**Document:** Conversation Engine

**Version:** 1.0

**Status:** Draft

**Owner:** Niranjan Sah

---

# 1. Purpose

The Conversation Engine is the heart of InterviewPilot AI.

Unlike traditional chatbot systems where an LLM simply responds to user input, InterviewPilot AI treats conversation as a deterministic runtime governed by explicit state transitions, event orchestration, contextual memory, and interview objectives.

The Conversation Engine owns:

* interview progression
* topic management
* follow-up generation
* interruption handling
* recovery
* completion logic

The language model is responsible only for language generation.

---

# 2. Engineering Philosophy

The Conversation Engine follows one central principle:

> **Conversations are stateful workflows—not chat messages.**

Every user interaction changes the interview state.

Every AI response should move the interview closer toward its objective.

The runtime—not the LLM—controls interview direction.

---

# 3. Design Goals

The engine has seven primary objectives.

## Natural Conversations

Avoid scripted question banks.

---

## Adaptive Interviews

Questions evolve based on responses.

---

## Deterministic Runtime

Interview progression is application controlled.

---

## Interruptible

Support real voice conversations.

---

## Recoverable

Unexpected failures should preserve progress.

---

## Observable

Every state transition is measurable.

---

## Extensible

New interview types should require configuration rather than architectural changes.

---

# 4. Runtime Architecture

```text
Candidate

↓

Voice Stream

↓

Speech Processing

↓

Conversation Engine

├──────────── Session Manager

├──────────── State Machine

├──────────── Topic Manager

├──────────── Follow-up Engine

├──────────── Event Dispatcher

├──────────── Context Manager

├──────────── AI Runtime

└──────────── Evaluation Queue

↓

Persistence Layer

↓

Database
```

Each component owns one responsibility.

---

# 5. Interview State Machine

Every interview progresses through deterministic states.

```text
Idle

↓

Created

↓

Initializing

↓

Greeting

↓

Listening

↓

Thinking

↓

Responding

↓

Waiting

↓

Transitioning Topic

↓

Evaluating

↓

Completed

↓

Archived
```

Only one state may exist simultaneously.

---

# 6. State Responsibilities

## Idle

No active interview.

---

## Created

Session exists.

Resources allocated.

---

## Initializing

Interview configuration loaded.

Context prepared.

AI initialized.

---

## Greeting

AI introduces itself.

Explains interview format.

Sets expectations.

---

## Listening

Candidate speaking.

System captures audio.

Transcript updates continuously.

---

## Thinking

Conversation Engine analyzes:

* interview objective
* previous answer
* topic completion
* follow-up opportunities

---

## Responding

AI generates response.

Runtime validates output.

Transcript updated.

---

## Waiting

Awaiting candidate response.

Timers become active.

---

## Transitioning

Previous topic complete.

Next objective selected.

Conversation summary updated.

---

## Evaluating

Interview finished.

Evaluation pipeline begins.

---

## Completed

Report generated.

Session locked.

---

## Archived

Future long-term storage.

---

# 7. State Transition Rules

Examples:

```text
Greeting

↓

Listening

↓

Thinking

↓

Responding

↓

Waiting

↓

Listening
```

Illegal transitions:

Completed → Listening

Archived → Responding

Idle → Evaluation

These should always be rejected.

---

# 8. Runtime Invariants

The following rules must always remain true.

Only one active interview per user.

Only one active conversation state.

Only one active speaker.

Transcript order never changes.

Interview completion is irreversible.

Evaluation only begins after completion.

These invariants simplify debugging and guarantee deterministic behavior.



---

# 9. Event-Driven Architecture

The Conversation Engine operates using an internal event bus.

Components communicate through events rather than direct dependencies.

Benefits include:

* loose coupling
* easier testing
* replayable conversations
* better observability

---

# 10. Core Events

Examples include:

InterviewCreated

InterviewStarted

AudioReceived

TranscriptUpdated

TopicCompleted

FollowUpGenerated

AIResponseReceived

CandidateInterrupted

SilenceDetected

SessionPaused

SessionRecovered

InterviewCompleted

EvaluationStarted

EvaluationFinished

---

# 11. Event Flow

```text
Audio Received

↓

Speech Recognized

↓

Transcript Updated

↓

Conversation State Updated

↓

Context Rebuilt

↓

Prompt Generated

↓

LLM Response

↓

Validated

↓

Transcript Stored

↓

Voice Output
```

Each event is logged independently.

---

# 12. Turn Management

InterviewPilot AI follows strict turn-taking.

Only one participant may speak at any moment.

```text
AI Speaking

↓

Candidate Listening

↓

AI Finished

↓

Candidate Speaking

↓

AI Listening

↓

Candidate Finished

↓

AI Thinking

↓

AI Speaking
```

Interruptions remain exceptions.

---

# 13. Speaker Ownership

Possible speakers:

AI

Candidate

System

Speaker ownership determines:

* microphone status
* transcript destination
* timeout logic
* interruption handling

---

# 14. Active Listening

During candidate speech the runtime performs:

Audio buffering

Speech recognition

Transcript streaming

Silence monitoring

Confidence scoring

No AI generation occurs until speech completion.

---

# 15. Thinking Phase

Thinking is deterministic.

Responsibilities:

Update interview state

Select topic

Choose objective

Determine follow-up

Compile prompt

Invoke LLM

The language model participates only after these steps complete.

---

# 16. Response Validation

Every response passes through validation.

Checks include:

Maximum length

Empty response

JSON schema

Tool requests

Unsafe content

Repeated questions

Responses failing validation are regenerated or repaired.

---

# 17. Event Logging

Every conversation event includes:

Event ID

Timestamp

Session ID

Current State

Duration

Source

Correlation ID

Logs should support replaying complete interview sessions for debugging.


---

# 18. Topic Graph

InterviewPilot AI does not use a linear question list.

Instead it traverses a topic graph.

```text
Introduction

↓

Background

↓

Technical

├──────────────┐

Backend

Frontend

Database

System Design

↓

Behavioral

↓

Career Goals

↓

Closing
```

Transitions depend on conversation quality.

---

# 19. Topic Manager

Each topic tracks:

Current Status

Difficulty

Coverage

Confidence

Follow-up Count

Evaluation Status

Possible states:

Pending

Active

Completed

Skipped

---

# 20. Adaptive Difficulty

Difficulty changes dynamically.

Signals considered:

Technical accuracy

Confidence

Communication quality

Depth

Time spent

Possible actions:

Increase

Maintain

Decrease

Difficulty should evolve naturally.

---

# 21. Follow-up Engine

The runtime determines whether additional questioning is required.

Decision tree:

```text
Candidate Answer

↓

Complete?

↓

Yes → Next Topic

↓

No

↓

Needs Clarification?

↓

Yes → Clarify

↓

Weak Technical Depth?

↓

Yes → Probe

↓

Strong Answer?

↓

Yes → Increase Difficulty
```

The LLM writes questions.

The engine decides direction.

---

# 22. Topic Completion

A topic completes when:

Objectives satisfied

Required depth achieved

Maximum follow-ups reached

Time budget exceeded

Completion is determined by the runtime—not the language model.

---

# 23. Interview Progress

Progress is measured using objective completion rather than question count.

Example:

```text
Introduction

✓

Background

✓

Backend

70%

Database

40%

Behavioral

Pending

Closing

Pending
```

This enables adaptive pacing and intelligent interview completion.

---

# 24. Transition Strategy

Topic transitions should feel conversational.

Avoid abrupt changes.

Example:

Instead of:

> "Next question."

Prefer:

> "We've discussed API design in detail. Let's shift our focus to database optimization."

Natural transitions improve immersion and interview realism.

---

# Related Documents

* LLM_ARCHITECTURE.md
* AI_ENGINE.md
* DATABASE_ARCHITECTURE.md
* API.md
