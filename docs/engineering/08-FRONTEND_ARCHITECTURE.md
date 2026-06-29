
# Frontend Architecture

**Project:** InterviewPilot AI

**Document:** Frontend Architecture

**Version:** 1.0

**Status:** Draft

**Owner:** Niranjan Sah

---

# 1. Purpose

This document defines the frontend architecture of InterviewPilot AI.

The objective is to build a scalable, maintainable, and performant application capable of delivering a real-time voice interview experience while remaining easy to extend as the product evolves.

The frontend architecture prioritizes:

* predictable state management
* modular feature organization
* reusable UI components
* accessibility
* performance
* developer experience
* production readiness

---

# 2. Architecture Principles

The frontend follows several guiding principles.

## Feature First

Organize code by business capability rather than technology.

Avoid:

```
components/
pages/
hooks/
```

Prefer:

```
features/
    auth/
    interview/
    dashboard/
    reports/
```

---

## Composition over Inheritance

UI should be assembled from reusable building blocks.

Small components should compose larger interfaces.

---

## Server First

Whenever possible, rendering should occur on the server.

Client Components should exist only where interactivity requires them.

---

## Thin Pages

Pages should orchestrate data.

Business logic belongs inside services, hooks, and feature modules.

---

## Predictable Data Flow

Data should move in one direction.

```
Server

↓

Route

↓

Page

↓

Feature

↓

Component
```

---

# 3. Technology Stack

Framework

* Next.js App Router

Language

* TypeScript

Styling

* Tailwind CSS

Component Library

* shadcn/ui

Icons

* Lucide

Animation

* Framer Motion

State

* Zustand

Forms

* React Hook Form

Validation

* Zod

Tables

* TanStack Table

Charts

* Recharts

Notifications

* Sonner

---

# 4. Application Layers

```text
Browser

↓

App Router

↓

Layouts

↓

Pages

↓

Features

↓

Components

↓

Hooks

↓

Services

↓

API
```

Every layer owns one responsibility.

---

# 5. Folder Structure

```
src/

app/

components/

features/

hooks/

lib/

providers/

services/

stores/

styles/

types/

utils/

constants/

config/
```

Each directory exists for a clearly defined purpose.

---

# 6. Feature Organization

Every business feature owns its implementation.

Example:

```
features/

interview/

components/

hooks/

services/

types/

utils/

constants/
```

This minimizes coupling between unrelated features.

---

# 7. Component Hierarchy

```
Page

↓

Feature

↓

Section

↓

Component

↓

Primitive
```

Example

```
Interview Page

↓

Interview Layout

↓

Conversation Panel

↓

Transcript

↓

Transcript Line
```

Small components remain reusable.

---

# 8. Rendering Strategy

The application intentionally mixes Server Components and Client Components.

Server Components

* layouts
* dashboards
* history
* reports

Client Components

* microphone
* waveform
* realtime transcript
* timers
* animations
* interview session

This minimizes JavaScript while maintaining responsiveness.

---

# 9. Shared Layout System

The application consists of three layout groups.

Public Layout

```
Landing

About

Login
```

Application Layout

```
Dashboard

History

Settings

Reports
```

Interview Layout

```
Voice Interview

Transcript

Progress

Evaluation
```

Each layout provides a consistent navigation experience.

---

# 10. Navigation

Primary navigation remains intentionally small.

```
Dashboard

Interviews

Reports

Settings
```

Navigation should never distract from the interview experience.

---

# 11. Design Tokens

All visual values originate from the Design System.

No hardcoded:

* colors
* spacing
* typography
* shadows
* border radius

Every value references centralized tokens.

---

# 12. Performance Goals

First Load

<2 seconds

Interaction

<100ms

Animation

60 FPS

Bundle

Minimal client JavaScript

The frontend should prioritize perceived performance over raw benchmarks.

---

# 13. Accessibility

Every interactive component must support:

* keyboard navigation
* visible focus states
* screen readers
* reduced motion
* semantic HTML

Accessibility is a first-class engineering requirement.

---

# 14. Future Evolution

Future improvements may include:

* offline support
* PWA capabilities
* multi-language UI
* collaborative interview sessions
* recruiter dashboards

The architecture should accommodate these features without significant restructuring.

---

# Related Documents

* DESIGN_SYSTEM.md
* UI_ARCHITECTURE.md
* STATE_MANAGEMENT.md
* BACKEND_ARCHITECTURE.md
* API.md

