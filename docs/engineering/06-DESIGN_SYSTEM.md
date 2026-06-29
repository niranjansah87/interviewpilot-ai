# Design System

**Product:** InterviewPilot AI

**Document:** Design System

**Version:** 1.0

**Status:** Draft

**Owner:** Niranjan Sah

---

# 1. Purpose

The InterviewPilot AI Design System establishes the visual language, interaction principles, accessibility standards, and reusable UI foundations for the platform.

Its purpose is not simply to define colors and components, but to create a cohesive product experience that feels premium, trustworthy, and intentionally crafted.

The design system should enable rapid feature development while maintaining visual consistency and reducing design debt.

---

# 2. Design Philosophy

InterviewPilot AI is not designed to resemble a typical AI chatbot.

Instead, the interface should feel like a premium SaaS application built for professionals preparing for important career moments.

The product should communicate confidence through simplicity rather than visual complexity.

---

# 3. Core Design Principles

## Calm

Interfaces should reduce interview anxiety rather than increase cognitive load.

Avoid visual noise.

---

## Focused

Every screen should have one obvious primary action.

Users should never wonder what to do next.

---

## Human

Interactions should feel conversational and supportive without becoming playful or distracting.

The interface should never compete with the conversation itself.

---

## Functional Motion

Animations exist to explain change.

Motion should never exist solely for decoration.

---

## Invisible Complexity

Complex AI workflows should appear simple.

Users should experience intelligence—not configuration.

---

# 4. Brand Personality

InterviewPilot AI should feel:

* Professional
* Modern
* Calm
* Intelligent
* Trustworthy
* Minimal
* Premium

The visual language should communicate confidence without appearing corporate or sterile.

---

# 5. Design Inspiration

The product draws inspiration from:

* Linear
* Raycast
* Vercel
* Stripe Dashboard
* Apple Human Interface Guidelines
* Notion Calendar

Explicitly avoid:

* Neon gradients
* Cyberpunk aesthetics
* Floating robots
* Excessive glassmorphism
* Generic AI illustrations
* Flashy landing pages

---

# 6. Experience Goals

Every interaction should satisfy the following objectives.

Users should:

* immediately understand the interface,
* remain focused on the interview,
* experience minimal friction,
* feel confident throughout the session,
* trust the generated feedback.

The interface should disappear behind the experience.

---

# 7. Visual Language

The UI is intentionally understated.

Characteristics include:

* generous whitespace,
* strong typography,
* restrained color palette,
* soft shadows,
* subtle elevation,
* rounded geometry,
* minimal decoration.

The visual hierarchy should emerge from spacing and typography rather than bright colors.

---

# 8. Emotional Journey

The product should guide users through four emotional stages.

```text
Curiosity

↓

Confidence

↓

Focus

↓

Achievement
```

Every screen should reinforce this progression.

---

# 9. First Impression

The landing page should immediately communicate professionalism.

Within five seconds users should understand:

* what the product does,
* who it is for,
* why it is different.

Avoid overwhelming users with excessive content.

Clarity takes priority over marketing.

---

# 10. Design Quality Bar

Every interface should satisfy these questions before release.

Does it look expensive?

Would it still look modern three years from now?

Does every animation communicate purpose?

Can unnecessary elements be removed?

Would this feel natural in a professional product?

If the answer to any question is "No", the design should be refined before implementation.

---

# Related Documents

* UI_ARCHITECTURE.md
* FRONTEND_ARCHITECTURE.md
* UX_CASE_STUDY.

# Design System

**Product:** InterviewPilot AI
**Document:** Design System
**Version:** 1.0
**Status:** Draft
**Owner:** Niranjan Sah

---

# 1. Purpose

This document defines the visual design system for InterviewPilot AI, including color palette, typography, spacing, and component guidelines.

---

# 2. Color Palette

## Primary Colors

| Name          | Hex     | Usage                   |
| ------------- | ------- | ----------------------- |
| Primary       | #2563EB | Buttons, links, accents |
| Primary Dark  | #1D4ED8 | Hover states            |
| Primary Light | #3B82F6 | Light backgrounds       |

## Neutral Colors

| Name           | Hex     | Usage             |
| -------------- | ------- | ----------------- |
| Background     | #FFFFFF | Page background   |
| Surface        | #F8FAFC | Card backgrounds  |
| Border         | #E2E8F0 | Dividers, borders |
| Text Primary   | #0F172A | Headlines, body   |
| Text Secondary | #64748B | Captions, hints   |
| Text Muted     | #94A3B8 | Placeholders      |

## Semantic Colors

| Name    | Hex     | Usage               |
| ------- | ------- | ------------------- |
| Success | #10B981 | Positive feedback   |
| Warning | #F59E0B | Cautions            |
| Error   | #EF4444 | Errors, destructive |
| Info    | #3B82F6 | Informational       |

---

# 3. Typography

## Font Family

**Inter** — Primary typeface for all UI text.

**Monospace** — Code, transcripts.

## Type Scale

| Element | Size     | Weight | Line Height |
| ------- | -------- | ------ | ----------- |
| H1      | 2.25rem  | 700    | 1.2         |
| H2      | 1.875rem | 700    | 1.3         |
| H3      | 1.5rem   | 600    | 1.4         |
| Body    | 1rem     | 400    | 1.6         |
| Small   | 0.875rem | 400    | 1.5         |
| Caption | 0.75rem  | 400    | 1.4         |

---

# 4. Spacing

Base unit: 4px

| Token | Value |
| ----- | ----- |
| xs    | 4px   |
| sm    | 8px   |
| md    | 16px  |
| lg    | 24px  |
| xl    | 32px  |
| 2xl   | 48px  |
| 3xl   | 64px  |

---

# 5. Border Radius

| Token | Value  |
| ----- | ------ |
| sm    | 4px    |
| md    | 8px    |
| lg    | 12px   |
| xl    | 16px   |
| full  | 9999px |

---

# 6. Shadows

| Token | Value                       |
| ----- | --------------------------- |
| sm    | 0 1px 2px rgba(0,0,0,0.05)  |
| md    | 0 4px 6px rgba(0,0,0,0.1)   |
| lg    | 0 10px 15px rgba(0,0,0,0.1) |

---

# 7. Components

## Buttons

- **Primary** — Filled, primary color
- **Secondary** — Outlined
- **Ghost** — Text only
- **States** — default, hover, active, disabled, loading

## Inputs

- Text fields
- Textarea
- Select dropdowns
- Checkboxes
- Radio buttons

## Cards

- Surface background
- Border or shadow
- Padding: lg

## Badges

- Status indicators
- Labels
- Counts

---

# 8. Responsive Breakpoints

| Name | Min Width |
| ---- | --------- |
| sm   | 640px     |
| md   | 768px     |
| lg   | 1024px    |
| xl   | 1280px    |
| 2xl  | 1536px    |

---

# 9. Related Documents

- 01-ARCHITECTURE.md
- 02-TECHSTACK.md




---
# 11. Color Philosophy

Color should communicate meaning rather than decoration.

The interface intentionally uses a restrained palette to reduce cognitive load and improve readability.

Accent colors are reserved for interaction, progress, and system status.
---
# 12. Primary Palette

## Background

```
#09090B
```

Primary application background.

---

## Surface

```
#111113
```

Cards, panels, modals.

---

## Elevated Surface

```
#18181B
```

Hovered containers.

---

## Border

```
rgba(255,255,255,0.08)
```

Subtle separation.

---

## Primary Accent

```
#2563EB
```

Interactive elements.

---

## Success

```
#10B981
```

Completed interviews.

Positive states.

---

## Warning

```
#F59E0B
```

Attention required.

---

## Error

```
#EF4444
```

Validation and failures.

---

# 13. Typography

Primary Typeface

Geist

Fallback

Inter

System Sans

Typography should prioritize readability over stylistic expression.

---

# 14. Type Scale

Display

48–64px

---

H1

40px

---

H2

32px

---

H3

24px

---

Body

16px

---

Caption

14px

---

Micro

12px

---

Use a consistent 1.25 modular scale throughout the application.

---

# 15. Spacing System

Spacing follows an 8-point grid.

Examples:

4

8

12

16

24

32

48

64

96

Consistent spacing creates rhythm and improves visual scanning.

---

# 16. Border Radius

Buttons

12px

Cards

18px

Dialogs

20px

Input Fields

12px

The interface should feel soft without becoming playful.

---

# 17. Shadows

Use subtle elevation.

Avoid heavy drop shadows.

Primary shadow:

```
0 8px 30px rgba(0,0,0,.28)
```

Hover shadow:

```
0 12px 40px rgba(0,0,0,.35)
```

Elevation should communicate hierarchy rather than decoration.

---

# 18. Glass Usage

Glassmorphism should be used sparingly.

Appropriate:

Navigation

Floating controls

Dialogs

Avoid:

Entire pages

Large cards

Forms

Tables

Transparency should support depth, not readability issues.

---

# 19. Icons

Preferred library:

Lucide

Characteristics:

* minimal
* consistent stroke width
* rounded ends
* scalable

Avoid mixing icon libraries.

---

# 20. Illustrations

Avoid AI-generated artwork.

Prefer:

* geometric illustrations
* abstract shapes
* subtle diagrams
* product visuals

The product should feel engineered rather than illustrated.

---

# Related Documents

* UI_ARCHITECTURE.md
* UX_CASE_STUDY.md



---
# 21. Motion Philosophy

Motion communicates system state.

It should never distract from the interview experience.

Animations should answer:

"What changed?"

rather than:

"Look what I can animate."
---
# 22. Animation Duration

Micro

100–150ms

---

Standard

180–240ms

---

Complex

280–400ms

Avoid animations longer than 500ms.

---

# 23. Easing

Default:

```
ease-out
```

Spring animations:

```
stiffness: 300

damping: 28
```

Motion should feel responsive rather than elastic.

---

# 24. Page Transitions

Fade

Slide

Scale

Use only one primary transition style across the application.

---

# 25. Loading States

Replace skeleton overload with meaningful placeholders.

Examples:

Interview Loading

Animated waveform

AI Thinking

Three animated dots

Transcript

Progressive streaming

Loading should reassure users that the system is actively working.

---

# 26. Voice Animations

Listening

Subtle microphone pulse.

---

Thinking

Soft animated dots.

---

Speaking

Waveform visualization.

---

Completed

Gentle success transition.

Animations should mirror conversation state.

---

# 27. Hover States

Hover effects should be restrained.

Examples:

2px elevation

Border highlight

Shadow increase

Small scale (1.01)

Avoid dramatic zoom effects.

---

# 28. Accessibility

Maintain:

WCAG AA contrast

Keyboard navigation

Visible focus rings

Reduced motion support

Readable typography

Every interaction should remain usable without animation.

---

# 29. Responsive Design

Desktop First

Tablet Optimized

Mobile Supported

No functionality should depend on screen size.

---

# 30. Design Review Checklist

Before shipping any UI:

✓ Consistent spacing

✓ Consistent typography

✓ Accessible contrast

✓ Purposeful animation

✓ Responsive layout

✓ Minimal cognitive load

✓ Premium visual quality

✓ No unnecessary decoration

---

# Related Documents

* FRONTEND_ARCHITECTURE.md
* UX_CASE_STUDY.md

````

---

# ⭐ My recommendation before writing a single React component

Create **one more document** that almost nobody writes:

```text
engineering/

UI_ARCHITECTURE.md
````

This is **not** about colors.

It defines:

* Every page
* Every layout
* Navigation
* Information architecture
* Component hierarchy
* Loading flow
* Empty states
* Error states
* Mobile layouts
* Responsive behavior
* Screen transitions
* Shared layouts

Think of it as the blueprint your frontend implementation will follow. Once that's written, building the UI becomes much more systematic, and the final product will feel cohesive rather than assembled page by page.



