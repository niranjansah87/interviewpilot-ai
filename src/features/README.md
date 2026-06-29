# Features

Feature-first modules. Each feature is self-contained with its own components, hooks, services, types, and utils.

## Structure

```
features/
└── <feature-name>/
    ├── README.md
    ├── index.ts
    ├── components/
    ├── hooks/
    ├── services/
    ├── types/
    └── utils/
```

## Principles

- Features should not import from other features directly — use services layer
- Feature public API is exposed via `index.ts`
- Keep features decoupled; shared logic goes in `src/lib/`

## Modules

- `authentication/` — Login, register, password reset
- `dashboard/` — Home, stats, overview
- `interview/` — Session, configuration, voice
- `voice/` — WebRTC, audio capture, streaming
- `feedback/` — Report generation, scoring
- `reports/` — Report viewing, sharing
- `profile/` — User profile management
- `settings/` — App settings, preferences
