
# Edge Cases

**Product:** InterviewPilot AI
**Document:** Edge Cases
**Version:** 1.0
**Status:** Draft
**Owner:** Niranjan Sah

---

# 1. Purpose

This document captures uncommon but important scenarios that the application must handle gracefully to ensure reliability and a high-quality user experience.

---

# Authentication

## User refreshes immediately after login

Expected Behavior

- Existing session should remain valid.
- User should not be forced to log in again.

---

## Expired JWT

Expected Behavior

- Redirect user to login.
- Preserve intended destination when appropriate.

---

# Interview Session

## User refreshes during interview

Expected Behavior

- Restore interview state if supported.
- Prevent duplicate interview sessions.

---

## Browser tab accidentally closed

Expected Behavior

- Persist interview progress when possible.
- Allow recovery if session remains active.

---

## User starts another interview while one is already active

Expected Behavior

- Prevent duplicate active sessions.
- Inform the user that an interview is already in progress.

---

# Voice Interaction

## Microphone permission denied

Expected Behavior

- Explain why microphone access is required.
- Provide retry option.

---

## Microphone disconnected during interview

Expected Behavior

- Pause interview.
- Notify user.
- Resume when microphone becomes available.

---

## Candidate remains silent

Expected Behavior

- Wait for a configurable timeout.
- Politely ask whether the candidate wishes to continue.

---

## AI interrupts candidate

Expected Behavior

- Support interruption handling where possible.
- Maintain conversational context.

---

# AI Services

## AI response timeout

Expected Behavior

- Retry request.
- Inform user if retry fails.

---

## AI generates irrelevant response

Expected Behavior

- Log event.
- Continue conversation.
- Allow future improvements through prompt refinement.

---

## AI service unavailable

Expected Behavior

- End interview gracefully.
- Preserve transcript.
- Allow retry later.

---

# Network

## Internet connection lost

Expected Behavior

- Display connection status.
- Attempt automatic reconnection.
- Resume interview when possible.

---

## Slow network

Expected Behavior

- Show loading indicator.
- Maintain interview state.

---

# Database

## Failed transcript save

Expected Behavior

- Retry automatically.
- Log failure.
- Notify user only if persistence ultimately fails.

---

## Partial interview completion

Expected Behavior

- Mark interview as incomplete.
- Allow user to review partial transcript.

---

# Security

## Invalid JWT

Expected Behavior

- Reject request.
- Return unauthorized response.

---

## Unauthorized report access

Expected Behavior

- Return access denied.
- Log security event.

---

# UI

## Page refresh

Expected Behavior

- Restore authenticated session.
- Recover UI state where applicable.

---

## Double-click actions

Expected Behavior

- Prevent duplicate API requests.

---

# Mobile Devices

## Small viewport

Expected Behavior

- Responsive layout.
- No overlapping controls.

---

## Orientation change

Expected Behavior

- Preserve interview session.
- Recalculate layout.

---

# Future Considerations

Additional edge cases may be introduced for:

- Multi-language interviews
- Offline support
- Video interviews
- Multiple AI providers
- Enterprise workspaces

---

# Related Documents

- 06-functional-requirements.md
- 07-non-functional-requirements.md
- ARCHITECTURE.md

