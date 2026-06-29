# AI Engine Architecture

**Product:** InterviewPilot AI
**Document:** AI Engine Architecture
**Version:** 1.0
**Status:** Draft
**Owner:** Niranjan Sah

---

# 1. Purpose

This document defines the architecture, responsibilities, lifecycle, and design principles of the InterviewPilot AI Engine.

The AI Engine is responsible for orchestrating realistic interview conversations rather than simply generating responses. It manages interview state, conversation flow, contextual memory, evaluation, transcript generation, and post-interview feedback while remaining independent of any specific AI provider.

The objective is to create an interview experience that feels conversational, adaptive, and production-ready.

---

# 2. Design Principles

The AI Engine follows five core principles.

## Conversation First

The interview should resemble a real conversation rather than a scripted question list.

---

## Context Awareness

Every candidate response influences future questions.

The AI should remember previous answers, detect contradictions, identify incomplete explanations, and adapt naturally.

---

## Separation of Concerns

The AI provider generates language.

The Interview Engine owns:

* Interview state
* Business rules
* Session lifecycle
* Evaluation pipeline
* Persistence

The application should never depend directly on AI provider behavior.

---

## Provider Agnostic

The engine communicates through an AI Provider abstraction.

Potential providers include:

* OpenAI Realtime
* Azure OpenAI
* Anthropic
* Gemini
* Future providers

Changing providers should require minimal changes outside the provider implementation.

---

## Deterministic Business Logic

Business decisions such as:

* interview completion
* session timeout
* report generation
* transcript persistence

must remain deterministic and owned by the application.

---

# 3. AI Engine Responsibilities

The engine is responsible for:

* Interview initialization
* Context management
* Prompt orchestration
* Conversation state
* AI communication
* Transcript persistence
* Feedback generation
* Session completion

It is intentionally not responsible for:

* Authentication
* Database implementation
* UI rendering
* Infrastructure provisioning

---

# 4. High-Level Architecture

```
                 Candidate

                     │

              Voice Interaction

                     │

        AI Provider (Realtime Voice)

                     │

────────────────────────────────────────────

             Interview Engine

     Session Manager

     Conversation Manager

     Prompt Builder

     Context Manager

     Transcript Manager

     Evaluation Engine

     Feedback Generator

────────────────────────────────────────────

               Repository Layer

                     │

                PostgreSQL
```

---

# 5. Interview Lifecycle

Every interview progresses through a predictable lifecycle.

```
Interview Created

↓

Session Initialized

↓

Context Created

↓

Greeting

↓

Question Generation

↓

Candidate Response

↓

Context Update

↓

Follow-up Decision

↓

Continue Interview

↓

Interview Completed

↓

Evaluation

↓

Feedback Report

↓

Persist Results
```

Each stage has clearly defined responsibilities and exit conditions.

---

# 6. Conversation State Machine

```
Idle

↓

Listening

↓

Processing

↓

Reasoning

↓

Responding

↓

Listening

↓

Completed
```

Only one active state may exist at a time.

State transitions are managed by the Interview Engine rather than the AI provider.

---

# 7. Core Components

## Session Manager

Responsible for:

* Creating interview sessions
* Managing session lifecycle
* Tracking interview status
* Handling interruptions
* Ending interviews

---

## Conversation Manager

Maintains conversational flow.

Responsibilities include:

* Current topic
* Previous questions
* Candidate responses
* Topic transitions
* Follow-up generation

---

## Prompt Builder

Constructs prompts dynamically using:

* Interview type
* Candidate experience
* Target role
* Previous conversation
* Current objectives

Prompts should never be hardcoded.

---

## Context Manager

Maintains interview memory.

Tracks:

* Previous answers
* Important facts
* Technical topics
* Behavioral examples
* Conversation history

Context should remain concise while preserving critical information.

---

## Transcript Manager

Responsible for:

* User transcript
* AI transcript
* Conversation ordering
* Timestamping
* Persistence

The transcript serves as the source of truth for post-interview analysis.

---

## Evaluation Engine

Runs after interview completion.

Evaluates:

* Technical understanding
* Communication
* Confidence
* Problem solving
* Clarity
* Completeness

The engine produces structured evaluation data independent of presentation.

---

## Feedback Generator

Transforms evaluation data into actionable insights.

Outputs include:

* Overall assessment
* Strengths
* Weaknesses
* Improvement suggestions
* Communication observations

---

# 8. Prompt Strategy

The AI is guided through structured prompts rather than predefined question lists.

Prompt construction consists of:

* System instructions
* Interview configuration
* Current conversation context
* Evaluation objectives
* Recent transcript

This approach enables adaptive conversations while maintaining consistent interview behavior.

---

# 9. Conversation Memory

The engine distinguishes between:

## Short-Term Memory

Current interview context.

Examples:

* Current topic
* Previous answer
* Active follow-up
* Immediate conversation state

---

## Long-Term Memory

Session-level knowledge.

Examples:

* Candidate background
* Technologies discussed
* Strengths identified
* Weaknesses identified

Only relevant information should be retained to minimize unnecessary context growth.

---

# 10. Follow-Up Decision Engine

After every candidate response, the engine determines the next action.

Possible outcomes include:

* Ask follow-up question
* Request clarification
* Challenge assumptions
* Change topic
* Conclude interview

The decision is based on conversation quality rather than predefined branching logic.

---

# 11. Token Optimization

To reduce latency and operational cost:

* Avoid repeatedly sending the full transcript
* Summarize historical context
* Retain only relevant conversational memory
* Remove redundant exchanges
* Reuse structured interview state

The objective is to maximize conversational quality while minimizing unnecessary token consumption.

---

# 12. Failure Handling

The AI Engine should gracefully recover from:

* Provider timeouts
* Temporary network interruptions
* Partial transcript failures
* Unexpected provider responses

Whenever recovery is not possible:

* Preserve interview progress
* Persist available transcript
* Inform the user
* Allow future retry

---

# 13. Future Enhancements

Planned improvements include:

* Multiple interviewer personalities
* Emotion-aware conversations
* Company-specific interview styles
* Resume-aware interviews
* Coding interview orchestration
* Adaptive interview difficulty
* Real-time coaching mode
* Multi-language conversations

The architecture should support these capabilities without major structural changes.

---

# 14. Related Documents

* ARCHITECTURE.md
* DATABASE.md
* API.md
* DESIGN_SYSTEM.md
* SECURITY.

# AI Engine

**Product:** InterviewPilot AI
**Document:** AI Interview Engine
**Version:** 1.0
**Status:** Draft
**Owner:** Niranjan Sah

---

# 1. Purpose

This document describes the AI Interview Engine, the core component responsible for conducting natural, adaptive voice interviews.

---

# 2. Overview

The AI Interview Engine transforms static question-and-answer flows into dynamic, conversational interviews. It maintains context across the conversation, generates follow-up questions, and adapts its approach based on candidate responses.

---

# 3. Core Capabilities

## Natural Language Understanding

The engine understands candidate responses in context, not just as isolated answers.

## Adaptive Questioning

Questions evolve based on:

- Previous responses
- Conversation flow
- Candidate confidence level
- Topic coverage

## Context Maintenance

The engine tracks:

- Topics discussed
- Points that need follow-up
- Contradictions to address
- Areas for deeper exploration

---

# 4. Conversation Flow

```
Start Interview
      │
      ▼
AI Introduces Itself
      │
      ▼
Ask Opening Question
      │
      ▼
Receive Candidate Response
      │
      ▼
Evaluate Response
      │
      ├── Follow-up Question
      ├── Challenge / Clarification
      ├── Acknowledge & Move On
      └── Probe Deeper
      │
      ▼
Decision: Continue or End?
      │
      ▼
Generate Feedback Report
```

---

# 5. AI Models

## Primary Model

**OpenAI GPT-4**

Used for:

- Question generation
- Response evaluation
- Follow-up decisions
- Feedback synthesis

## Voice Model

**OpenAI Realtime API (GPT-4o)**

Used for:

- Voice-to-voice conversation
- Real-time audio streaming
- Low-latency responses

---

# 6. Prompt Engineering

System prompts define:

- Interviewer persona
- Question guidelines
- Evaluation criteria
- Conversation style

Prompts are version-controlled and configurable.

---

# 7. Feedback Generation

After each interview, the engine generates:

- Overall score (1-100)
- Communication score
- Confidence indicators
- Strengths identified
- Areas for improvement
- Suggested answers
- Detailed summary

---

# 8. Configuration

| Parameter        | Description           | Default           |
| ---------------- | --------------------- | ----------------- |
| interview_type   | Type of interview     | behavioral        |
| target_role      | Job role              | software_engineer |
| experience_level | junior/mid/senior     | mid               |
| max_duration     | Max interview minutes | 30                |
| follow_up_depth  | How deep to probe     | medium            |

---

# 9. Limitations

- No vision/multimodal input
- Single language support (English MVP)
- No real-time code evaluation
- Generic feedback (not company-specific)

---

# 10. Related Documents

- 01-ARCHITECTURE.md
- 02-TECHSTACK.md
- 05-API.md

