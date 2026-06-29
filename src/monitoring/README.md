# Monitoring

Observability infrastructure: logging, metrics, and tracing.

## Structure

```
monitoring/
├── logger.ts      # Structured logger abstraction
├── metrics.ts     # Metrics collection
└── tracer.ts     # Distributed tracing (future)
```

## Rules

- Use the structured logger — never `console.log` in application code
- Logger must support log levels, structured fields, and request correlation
- All errors are logged with stack traces and context
- Metrics use a simple counter/gauge/histogram interface

## Placeholder

Monitoring is configured in Phase 1; full instrumentation in Phase 2.
