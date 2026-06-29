# Feature Specification: Feature Name

**Status:** Draft | In Review | Approved | In Development | Shipped
**Author:** Name
**Created:** YYYY-MM-DD
**Target Release:** vX.Y

---

## 1. Overview

One paragraph describing the feature. What does it do, and why does it matter?

---

## 2. User Story

```
As a [user type]
I want to [do something]
So that [achieve a goal]
```

---

## 3. Goals

### User Goals

- What does the user accomplish?
- What is the benefit?

### Business Goals

- What business metric does this improve?
- How does this support the product roadmap?

---

## 4. Non-Goals

What is explicitly out of scope for this feature?

---

## 5. Requirements

### Functional Requirements

| ID | Requirement | Priority |
|----|------------|----------|
| FR-1 | ... | Must |
| FR-2 | ... | Should |
| FR-3 | ... | Could |

### Non-Functional Requirements

| ID | Requirement | Notes |
|----|------------|-------|
| NFR-1 | Performance: ... | |
| NFR-2 | Accessibility: ... | |

---

## 6. Design

Include wireframes, screenshots, or links to Figma.

### UI Screens

### Interactions

### Edge Cases

---

## 7. API Design (if applicable)

### New Endpoints

| Method | Path | Description |
|--------|------|-------------|
| ... | ... | ... |

### Request / Response Shapes

```typescript
// Request
interface FeatureRequest {
  ...
}

// Response
interface FeatureResponse {
  ...
}
```

---

## 8. Data Model (if applicable)

Changes to Prisma schema:

```prisma
model Feature {
  ...
}
```

---

## 9. Metrics

| Metric | Target |
|--------|--------|
| Adoption rate | ... |
| User engagement | ... |
| Error rate | ... |

---

## 10. Dependencies

| Dependency | Owner | Status |
|-----------|-------|--------|
| AI provider | ... | ... |
| Design assets | ... | ... |

---

## 11. Open Questions

- Question 1?
- Question 2?

---

## 12. Related Documents

- [Feature PR](link)
- [Design doc](link)
- [ADR-XXXX](../decisions/ADR-XXXX.md)
