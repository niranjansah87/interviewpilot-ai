# UI Architecture

**Product:** InterviewPilot AI
**Document:** UI Architecture
**Version:** 1.0
**Status:** Draft
**Owner:** Niranjan Sah

---

## 1. Overview

The InterviewPilot AI frontend is built with Next.js 16, React 19, and TypeScript. This document describes how UI components are organized, how state flows, and how the routing structure maps to the visual layout.

---

## 2. Component Hierarchy

```
App Shell
├── Root Layout (providers, fonts, global styles)
│   └── Route Group Layouts
│       ├── (auth) Layout         → centered card, no sidebar
│       └── (dashboard) Layout    → sidebar + header
│
├── Pages
│   └── Route-specific components
│
└── Shared Components
    ├── ui/ (base components)
    └── features/ (composed components)
```

---

## 3. Layout Patterns

### Auth Layout `(auth)/`

```
┌──────────────────────────────────────┐
│                                      │
│              Logo                    │
│                                      │
│         ┌────────────────┐           │
│         │  Auth Form     │           │
│         │                │           │
│         └────────────────┘           │
│                                      │
│         Footer links                 │
│                                      │
└──────────────────────────────────────┘
```

- Centered vertically and horizontally
- No sidebar, no top navigation
- Minimal — the form is the entire focus

---

### Dashboard Layout `(dashboard)/`

```
┌─────────────────────────────────────────┐
│ Header: Logo │ Search │ User │ Notifs  │
├────────┬────────────────────────────────┤
│        │                                │
│ Side-  │   Main Content Area            │
│ bar    │                                │
│        │   ┌────────┐  ┌────────┐       │
│ Nav    │   │ Widget │  │ Widget │       │
│ items  │   └────────┘  └────────┘       │
│        │                                │
│        │   ┌────────────────────┐       │
│        │   │  Content Panel    │       │
│        │   └────────────────────┘       │
│        │                                │
└────────┴────────────────────────────────┘
```

---

### Interview Layout (full-screen focus)

```
┌─────────────────────────────────────────┐
│ ← Back         Interview        00:15  │
├─────────────────────────────────────────┤
│                                         │
│         Voice Interface                 │
│         (primary focus)                 │
│                                         │
│         🎤 Candidate speaking           │
│                                         │
├─────────────────────────────────────────┤
│ Transcript (collapsible, bottom)        │
└─────────────────────────────────────────┘
```

The interview page uses the dashboard layout but overrides the main content area with a focused, distraction-free interface. The sidebar collapses or hides.

---

## 4. Routing Structure

```
/                          → Landing page (public)
/login                     → (auth)/login/page.tsx
/register                  → (auth)/register/page.tsx

/dashboard                → (dashboard)/page.tsx
/interviews               → (dashboard)/interviews/page.tsx
/interviews/new           → (dashboard)/interviews/new/page.tsx
/interviews/:id           → (dashboard)/interviews/[id]/page.tsx
/interviews/:id/report    → (dashboard)/interviews/[id]/report/page.tsx
/settings                 → (dashboard)/settings/page.tsx
```

---

## 5. State Management

### Server State (React Query / TanStack Query)

- Interview sessions
- User data
- Transcripts
- Feedback reports

```typescript
// Example: fetching interview sessions
const { data, isLoading } = useQuery({
  queryKey: ['interviews'],
  queryFn: () => api.interviews.list(),
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

### Client State (Zustand)

- UI preferences (sidebar collapsed, theme)
- Voice interface state (isListening, isSpeaking)
- Modal/Sheet visibility
- Form drafts (local only)

### Form State (React Hook Form + Zod)

- Login form
- Register form
- Interview configuration form

---

## 6. Voice Interface Components

```
VoiceInterface
├── VoiceStatusIndicator
│   ├── Idle
│   ├── Connecting
│   ├── Listening
│   ├── Processing
│   └── Speaking
├── AudioVisualizer (waveform)
├── TranscriptStream
│   ├── TranscriptEntry (interviewer)
│   └── TranscriptEntry (candidate)
├── ControlBar
│   ├── MuteButton
│   ├── EndInterviewButton
│   └── SettingsButton
└── ConnectionIndicator
```

---

## 7. Responsive Breakpoints

| Breakpoint | Width | Layout Adaptation |
|------------|-------|------------------|
| Mobile | < 640px | Single column, bottom nav |
| Tablet | 640–1024px | Collapsible sidebar |
| Desktop | > 1024px | Full layout with persistent sidebar |

---

## 8. Accessibility

- All interactive elements have `aria-label` or visible text
- Voice state changes announced via `aria-live` regions
- Focus is trapped in modals and sheets
- Color contrast meets WCAG AA (4.5:1 for normal text)
- Reduced motion respected via `prefers-reduced-motion`

---

## 9. Related Documents

- [06-DESIGN_SYSTEM.md](06-DESIGN_SYSTEM.md)
- [UX_CASE_STUDY.md](UX_CASE_STUDY.md)
- [13-FOLDER_STRUCTURE.md](13-FOLDER_STRUCTURE.md)
