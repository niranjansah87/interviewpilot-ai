/**
 * Database seed — creates development and testing data.
 *
 * Run: npx prisma db seed
 * (reads DATABASE_URL from .env or .env.local)
 */

import { PrismaClient } from "@prisma/client";
import { createHash } from "node:crypto";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

async function main() {
  console.log("🌱 Seeding database...\n");

  // ── Clean existing data ────────────────────────────────────────
  await prisma.feedbackReport.deleteMany();
  await prisma.transcriptEntry.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.interviewSession.deleteMany();
  await prisma.user.deleteMany();

  // ── Users ──────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("password123", 12);

  const alice = await prisma.user.create({
    data: {
      email: "alice@example.com",
      passwordHash,
      name: "Alice Chen",
      role: "USER",
    },
  });

  const bob = await prisma.user.create({
    data: {
      email: "bob@example.com",
      passwordHash,
      name: "Bob Kumar",
      role: "USER",
    },
  });

  console.log(`  ✅ Users: ${alice.email}, ${bob.email}`);

  // ── Interview Sessions ─────────────────────────────────────────
  const now = new Date();

  // Completed behavioral interview
  const interview1 = await prisma.interviewSession.create({
    data: {
      userId: alice.id,
      type: "BEHAVIORAL",
      targetRole: "Product Manager",
      experienceLevel: "MID",
      status: "COMPLETED",
      startedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      endedAt: new Date(now.getTime() - 1.5 * 60 * 60 * 1000),
      durationSeconds: 1800,
    },
  });

  // Active technical interview
  await prisma.interviewSession.create({
    data: {
      userId: alice.id,
      type: "TECHNICAL",
      targetRole: "Senior Frontend Engineer",
      experienceLevel: "SENIOR",
      status: "ACTIVE",
      startedAt: new Date(now.getTime() - 30 * 60 * 1000),
    },
  });

  // Completed mixed interview for Bob
  const interview3 = await prisma.interviewSession.create({
    data: {
      userId: bob.id,
      type: "MIXED",
      targetRole: "Full Stack Developer",
      experienceLevel: "JUNIOR",
      status: "COMPLETED",
      startedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      endedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000 + 25 * 60 * 1000),
      durationSeconds: 1500,
    },
  });

  // Created but not started
  await prisma.interviewSession.create({
    data: {
      userId: bob.id,
      type: "BEHAVIORAL",
      targetRole: "Engineering Manager",
      experienceLevel: "SENIOR",
      status: "CREATED",
    },
  });

  console.log("  ✅ 4 interview sessions (COMPLETED, ACTIVE, COMPLETED, CREATED)");

  // ── Transcript Entries ─────────────────────────────────────────
  const transcriptData = [
    {
      sessionId: interview1.id,
      role: "INTERVIEWER" as const,
      content:
        "Welcome, Alice! Let's start with a behavioral question. Can you tell me about a time you had to influence a cross-functional team without direct authority?",
    },
    {
      sessionId: interview1.id,
      role: "CANDIDATE" as const,
      content:
        "Absolutely. At my last role, I was leading a product initiative that required engineering, design, and marketing alignment. I organized a workshop where each team could voice their concerns, then synthesized the feedback into a shared roadmap. By framing decisions around user outcomes rather than team preferences, we reached consensus in two weeks instead of the usual month-long negotiation.",
    },
    {
      sessionId: interview1.id,
      role: "INTERVIEWER" as const,
      content:
        "That's a great example of stakeholder alignment. How did you handle a situation where one team was particularly resistant to the direction?",
    },
    {
      sessionId: interview1.id,
      role: "CANDIDATE" as const,
      content:
        "The engineering team was concerned about the timeline. I worked with the tech lead to break the feature into phases — an MVP that proved the concept in 4 weeks, followed by the full implementation. This de-risked the project and got engineering fully on board because they had a say in the scoping.",
    },
    {
      sessionId: interview1.id,
      role: "INTERVIEWER" as const,
      content:
        "Excellent approach. Let's shift gears — describe a situation where you had to make a difficult decision with incomplete information.",
    },
    {
      sessionId: interview1.id,
      role: "CANDIDATE" as const,
      content:
        "During our pricing page redesign, we had conflicting A/B test results. One variant showed higher conversion but lower average order value, and the other showed the opposite. I decided to run a third variant that combined elements of both — the simplified UX from variant A with the transparent pricing display from variant B. It outperformed both originals. The key was recognizing that the data wasn't contradictory — it was telling us different parts of the story.",
    },
    // Bob's interview transcript
    {
      sessionId: interview3.id,
      role: "INTERVIEWER" as const,
      content:
        "Hi Bob! Let's start with a technical question. Can you walk me through how you'd design a real-time notification system?",
    },
    {
      sessionId: interview3.id,
      role: "CANDIDATE" as const,
      content:
        "I'd start with WebSockets for the real-time transport layer. On the backend, I'd use a pub/sub pattern — probably Redis Pub/Sub or RabbitMQ — so services can publish events and the notification service subscribes. Each user connection would be mapped to a WebSocket session, and notifications would be fanned out based on user subscriptions stored in PostgreSQL.",
    },
    {
      sessionId: interview3.id,
      role: "INTERVIEWER" as const,
      content:
        "Good. What about handling delivery guarantees? How do you make sure a notification isn't lost if the user is offline?",
    },
    {
      sessionId: interview3.id,
      role: "CANDIDATE" as const,
      content:
        "I'd implement a persistent outbox pattern. When a notification event is published, it's first written to a `notifications` table with a status of 'pending'. The WebSocket handler attempts delivery and marks it 'delivered'. If the user is offline, the notification stays pending. On reconnect, the client sends its last-seen notification ID, and the server replays any missed ones. For mobile push, I'd integrate FCM or APNs as a fallback channel.",
    },
  ];

  for (const entry of transcriptData) {
    await prisma.transcriptEntry.create({
      data: entry,
    });
  }

  console.log(`  ✅ ${transcriptData.length} transcript entries`);

  // ── Feedback Reports ───────────────────────────────────────────
  await prisma.feedbackReport.create({
    data: {
      sessionId: interview1.id,
      overallScore: 82,
      communicationScore: 88,
      confidenceScore: 78,
      technicalReasoning: null,
      strengths: JSON.stringify([
        "Excellent use of the STAR method — every answer had a clear Situation, Task, Action, and Result",
        "Strong stakeholder management skills demonstrated with concrete examples",
        "Data-driven decision making illustrated well in the pricing page example",
        "Natural conversational tone — answers felt genuine, not rehearsed",
      ]),
      weaknesses: JSON.stringify([
        "Could have quantified impact more precisely (e.g., 'improved conversion by X%')",
        "Some answers ran long — aim for 2-3 minutes per response",
        "Didn't proactively connect experience to the target Product Manager role",
      ]),
      improvements: JSON.stringify([
        "Prepare 2-3 metrics-driven stories with specific numbers (revenue, users, engagement)",
        "Practice concise delivery — record yourself and trim answers under 3 minutes",
        "Research the company's products before the interview and weave in relevant insights",
        "For behavioral questions, always end with what you learned and how you'd apply it",
      ]),
      summary:
        "Alice demonstrated strong behavioral interview skills with well-structured STAR responses and genuine examples of cross-functional leadership. Communication was clear and engaging (88/100). Areas for growth include quantifying impact with specific metrics and tightening response length. Overall a solid performance that would be competitive for mid-level PM roles. With practice on metrics-driven storytelling, Alice could perform at a senior level.",
    },
  });

  await prisma.feedbackReport.create({
    data: {
      sessionId: interview3.id,
      overallScore: 74,
      communicationScore: 72,
      confidenceScore: 68,
      technicalReasoning: 82,
      strengths: JSON.stringify([
        "Solid system design fundamentals — correctly identified WebSocket + pub/sub pattern",
        "Good understanding of delivery guarantees and the outbox pattern",
        "Pragmatic approach — mentioned specific technologies without over-engineering",
      ]),
      weaknesses: JSON.stringify([
        "Didn't discuss scalability limits or horizontal scaling strategy",
        "Could have mentioned monitoring and observability of the notification pipeline",
        "Answers were technically correct but lacked depth on edge cases and failure modes",
      ]),
      improvements: JSON.stringify([
        "Study distributed systems patterns — especially consistency models and failure handling",
        "Practice system design interviews with a focus on scaling beyond the initial design",
        "Add monitoring, alerting, and SLO discussion to your system design answers",
        "Build confidence through mock interviews — technical knowledge is strong but delivery showed nerves",
      ]),
      summary:
        "Bob shows strong backend fundamentals and good instinct for practical architecture decisions. Technical reasoning scored 82/100 — the core design was correct and production-ready. The main gap is depth: Bob should push beyond the first correct answer to discuss scaling, failure modes, and trade-offs. Confidence and communication will improve with more practice. Promising junior candidate with clear growth trajectory.",
    },
  });

  console.log("  ✅ 2 feedback reports\n");
  console.log("🌱 Seed complete!\n");
  console.log("Test accounts:");
  console.log("  alice@example.com / password123");
  console.log("  bob@example.com   / password123");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
