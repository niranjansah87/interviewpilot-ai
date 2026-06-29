# Templates

Standardized templates for creating consistent documentation across the project.

---

## Available Templates

| Template | Use For |
|----------|---------|
| `adr-template.md` | New Architecture Decision Records |
| `runbook-template.md` | Operational runbooks |
| `research-template.md` | Research and spike documents |
| `postmortem-template.md` | Incident postmortems |
| `feature-spec-template.md` | New feature specifications |
| `pull-request-template.md` | PR descriptions (GitHub default is in `.github/`) |

---

## How to Use

1. Copy the template to the appropriate folder.
2. Fill in all sections — don't leave `[TODO]` markers in merged documents.
3. For ADRs: increment the number (`0006-`, `0007-`, etc.) based on the existing count.
4. For feature specs: create a new folder under `docs/product/` or `docs/engineering/` as appropriate.

---

## Template Conventions

### ADRs (Architecture Decision Records)

```
docs/decisions/XXXX-<short-title>.md
```

Number format: 4 digits, zero-padded (`0001`, `0002`, ...)

### Runbooks

```
docs/runbooks/<short-title>.md
```

### Postmortems

```
docs/postmortems/YYYY-MM-DD-<incident-title>.md
```

### Feature Specs

```
docs/product/features/<feature-name>.md
```
