# InterviewPilot AI

> AI-powered voice interview platform that simulates realistic technical and behavioral interviews through dynamic conversations.

InterviewPilot AI enables candidates to practice interviews with an AI interviewer through natural voice conversations. Unlike traditional mock interview platforms that rely on static question banks, InterviewPilot generates contextual follow-up questions, adapts to candidate responses, and provides personalized feedback after each session.

---

## Features

### Real-Time Voice Interviews
Natural AI voice conversations powered by the OpenAI Realtime API — interruptible, low-latency, and context-aware.

### Adaptive Interview Engine
The interviewer adapts based on candidate responses, experience level, interview type, and conversation history. No scripted question trees.

### AI Feedback Reports
After every interview:
- Overall, Communication, and Confidence scores
- Strengths and areas for improvement
- Suggested responses
- Full transcript

### Authentication
JWT-based authentication with httpOnly cookies, bcrypt password hashing, and refresh token rotation.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React 19, TypeScript, TailwindCSS, shadcn/ui |
| State | Zustand, React Query |
| Animation | Framer Motion |
| Backend | Next.js Route Handlers |
| ORM | Prisma |
| Database | PostgreSQL (Supabase) |
| AI | OpenAI Realtime API, GPT-4 |
| Auth | JWT (jose), bcrypt |
| Deployment | Vercel |

---

## Architecture

```
Browser
   │
   ▼
Next.js Frontend
   │
   ├── Route Handlers (/api/*)
   ├── Service Layer
   ├── Prisma ORM
   └── PostgreSQL (Supabase)
           │
           ▼
      OpenAI Realtime API (voice)
      GPT-4 (feedback generation)
```

The project follows a layered architecture with clear separation between routing, business logic, and data access. See [docs/engineering/01-ARCHITECTURE.md](docs/engineering/01-ARCHITECTURE.md) for full details.

---

## Project Structure

```
interviewpilot-ai/
├── src/                         # Application source (created at implementation)
│   ├── app/                     # Next.js App Router
│   ├── components/              # UI components
│   ├── lib/                    # Utilities, API client, auth, AI adapters
│   ├── hooks/                  # Custom React hooks
│   ├── services/               # Business logic
│   └── types/                  # TypeScript types
├── prisma/                     # Database schema and migrations
├── public/                     # Static assets
├── tests/                      # E2E and integration tests
├── docs/                       # Full project documentation
├── .github/                    # CI/CD, issue templates
└── package.json
```

See [docs/engineering/13-FOLDER_STRUCTURE.md](docs/engineering/13-FOLDER_STRUCTURE.md) for the canonical folder layout.

---

## Getting Started

```bash
# Clone
git clone https://github.com/NiranjanDevX/interviewpilot-ai.git
cd interviewpilot-ai

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local   # if .env.example exists, otherwise see below

# Run development server
npm run dev

# Type check
npm run typecheck

# Lint
npm run lint
```

### Required Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Supabase PostgreSQL connection string |
| `JWT_SECRET` | Secret for signing JWT access tokens (min 32 chars) |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens |
| `OPENAI_API_KEY` | OpenAI API key |
| `OPENAI_REALTIME_MODEL` | Realtime model (e.g. `gpt-4o-realtime-preview`) |
| `NEXT_PUBLIC_APP_URL` | Application URL (e.g. `http://localhost:3000`) |

See [docs/engineering/08-DEPLOYMENT.md](docs/engineering/08-DEPLOYMENT.md) for full deployment instructions.

---

## Documentation

The `docs/` directory contains the full project documentation:

| Section | Contents |
|---------|----------|
| [docs/product/](docs/product/) | Product definition, user personas, requirements, roadmap |
| [docs/engineering/](docs/engineering/) | Architecture, tech stack, API, database, AI engine |
| [docs/decisions/](docs/decisions/) | Architecture Decision Records (ADRs) |
| [docs/runbooks/](docs/runbooks/) | Operational procedures |
| [docs/templates/](docs/templates/) | Document templates |

Start with [docs/README.md](docs/README.md) for the full documentation index.

---

## Interview Flow

```
Login → Select Type → AI Introduces → Candidate Speaks
                                    ↓
                        AI Evaluates + Follows Up
                                    ↓
                           Continue / Close
                                    ↓
                         Transcript Saved
                                    ↓
                         Feedback Generated
                                    ↓
                          Report on Dashboard
```

---

## Roadmap

### MVP (v1.0) — Current
- [x] User authentication
- [x] Voice interview sessions
- [x] Adaptive AI interviewer
- [x] AI feedback reports

### Future
- Resume-aware interviews
- Coding interview workspace
- System design interviews
- Multiple AI personas
- Video interviews
- Recruiter dashboard

See [docs/product/10-future-roadmap.md](docs/product/10-future-roadmap.md) for the full roadmap.

---

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) and the relevant engineering docs before submitting changes.

## Security

Security issues should be reported privately, not in public issues. See [SECURITY.md](SECURITY.md) for our security policy.

## License

MIT License. See [LICENSE.md](LICENSE.md).
