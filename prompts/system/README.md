# Prompts

System prompt templates for the AI interviewer and feedback generation.

## Structure

```
prompts/
└── system/
    ├── behavioral.md
    ├── technical.md
    ├── system-design.md
    ├── feedback.md
    ├── closing.md
    └── follow-up.md
```

## Rules

- Prompts are versioned; use timestamps in frontmatter
- Each prompt file has a corresponding test to verify output quality
- Prompt changes are reviewed like code changes
- Never hardcode prompt text in application code — load from files
- Use placeholder syntax: `{{INTERVIEW_TYPE}}`, `{{CANDIDATE_LEVEL}}`

## Prompt Types

| File | Purpose |
|------|---------|
| `behavioral.md` | Behavioral interview system prompt |
| `technical.md` | Technical discussion system prompt |
| `system-design.md` | System design interview prompt |
| `feedback.md` | Post-interview feedback generation prompt |
| `closing.md` | Interview closing prompt |
| `follow-up.md` | Dynamic follow-up question generation |
