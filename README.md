
# 🚀 InterviewPilot AI

> **AI-powered voice interview platform that simulates realistic technical and behavioral interviews through dynamic conversations.**

InterviewPilot AI is a full-stack application that enables candidates to practice interviews with an AI interviewer through natural voice conversations.

Unlike traditional mock interview platforms that rely on static question banks, InterviewPilot generates contextual follow-up questions, adapts to candidate responses, and provides personalized feedback after each interview session.

---

## ✨ Features

### 🎙️ Real-Time Voice Interviews

- Natural AI voice conversations
- Dynamic follow-up questions
- Context-aware interviewer
- Interruptible conversations
- Low-latency streaming

### 🧠 Adaptive Interview Engine

- Behavioral Interview
- Technical Interview *(Coming Soon)*
- System Design *(Coming Soon)*
- HR Interview *(Coming Soon)*

The interviewer adapts based on:

- Candidate responses
- Experience level
- Interview type
- Previous conversation context

---

### 📊 AI Feedback Report

After every interview the platform generates:

- Overall Score
- Communication Score
- Confidence Score
- Problem Solving
- Strengths
- Areas of Improvement
- Suggested Better Responses
- Complete Transcript

---

### 👤 Authentication

- Email Signup
- Login
- JWT Authentication
- Secure Password Hashing

---

### 📈 Dashboard

- Previous Interviews
- Interview Reports
- Interview History
- Progress Tracking

---

# 🏗 Architecture

```
                Next.js Frontend
                       │
         OpenAI Realtime Voice API
                       │
          Next.js Route Handlers
                       │
               Service Layer
                       │
             Prisma ORM
                       │
                PostgreSQL
```

The project follows a layered architecture that separates:

- UI
- Business Logic
- Database
- AI Providers

making future AI providers easy to integrate.

---

# ⚙ Tech Stack

## Frontend

- Next.js 15
- React 19
- TypeScript
- TailwindCSS
- shadcn/ui
- Zustand
- Framer Motion

## Backend

- Next.js Route Handlers
- Prisma ORM
- PostgreSQL
- JWT Authentication

## AI

- OpenAI Realtime API
- GPT-4.1 (Interview Feedback)
- Function Calling

## DevOps

- Docker
- Vercel
- Supabase PostgreSQL

---

# 📁 Project Structure

```
src
│
├── app
│
├── components
│
├── features
│   ├── auth
│   ├── dashboard
│   ├── interview
│   └── feedback
│
├── lib
│   ├── ai
│   ├── auth
│   ├── db
│   ├── services
│   ├── repositories
│   └── utils
│
├── hooks
│
├── types
│
└── prisma
```

---

# 🚀 Getting Started

Clone the repository

```bash
git clone https://github.com/NiranjanDevX/interviewpilot-ai.git
```

Move into the project

```bash
cd interviewpilot-ai
```

Install dependencies

```bash
npm install
```

Configure environment variables

```bash
cp .env.example .env.local
```

Run the development server

```bash
npm run dev
```

---

# 🔐 Environment Variables

```env
DATABASE_URL=

JWT_SECRET=

OPENAI_API_KEY=

OPENAI_REALTIME_MODEL=

NEXT_PUBLIC_APP_URL=
```

---

# 🧠 Interview Flow

```
Candidate

↓

Login

↓

Select Interview Type

↓

AI Starts Conversation

↓

Candidate Speaks

↓

Realtime AI Processes Context

↓

Dynamic Follow-up

↓

Conversation Ends

↓

Transcript Saved

↓

Feedback Generated

↓

Dashboard
```

---

# 🎯 Product Goals

- Human-like interview experience
- Dynamic conversations
- Real-time voice interaction
- Actionable feedback
- Production-ready architecture

---

# 📌 Roadmap

- [X] User Authentication
- [X] Voice Interview
- [X] Adaptive AI Conversation
- [X] Feedback Reports

Future Improvements

- Resume Upload
- Job Description Matching
- Multiple AI Personas
- Team Interviews
- Coding Interview Mode
- Video Interviews
- Interview Analytics

---

# 📷 Screenshots

Screenshots and demo GIFs will be added after the first release.

---

# 🌐 Repository

GitHub

https://github.com/NiranjanDevX/interviewpilot-ai

---

# 📄 License

MIT License