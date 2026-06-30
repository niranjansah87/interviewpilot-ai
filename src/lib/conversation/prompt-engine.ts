/**
 * Prompt Engine — composes modular prompts for the AI interviewer.
 * Prompts are built from reusable blocks, not concatenated strings.
 */

import type { InterviewContext, InterviewConfig } from './engine';

// ---- Prompt Blocks ----

export interface PromptBlock {
  /** Section identifier */
  name: string;
  /** Whether this block applies to the current context */
  applies(ctx: InterviewContext): boolean;
  /** Generate the prompt text */
  render(ctx: InterviewContext): string;
}

// ---- System Prompt Block ----

const SYSTEM_PROMPT: PromptBlock = {
  name: 'system',
  applies: () => true,
  render: () => `
You are an experienced technical interviewer conducting a professional interview.
Your goal is to evaluate the candidate fairly, challenge their thinking constructively,
and maintain a natural conversational flow.

Core rules:
- Ask ONE question at a time
- Listen to the full response before responding
- Challenge vague or incomplete answers — ask for specifics
- Acknowledge strong, well-structured responses
- Stay on topic; do not improvise unrelated questions
- Do not reveal that you are an AI
- Do not ask questions the candidate could not reasonably answer
- Keep responses concise (2-4 sentences). DO NOT LECTURE.
`.trim(),
};

// ---- Interview Type Block ----

const INTERVIEW_TYPE_BLOCK: PromptBlock = {
  name: 'interview_type',
  applies: () => true,
  render: (ctx) => {
    const type = ctx.config.type;
    switch (type) {
      case 'behavioral':
        return `
Interview Type: Behavioral
Focus on: past experiences, teamwork, leadership, conflict resolution, career growth.
Encourage the STAR method (Situation, Task, Action, Result) in responses.
Ask follow-up questions that probe for specifics and outcomes.
`.trim();
      case 'technical':
        return `
Interview Type: Technical
Focus on: system design, problem-solving, architecture decisions, trade-offs.
Ask the candidate to explain their reasoning — do not seek correct answers.
Probe for depth: "Why did you choose that approach?" "What trade-offs did you consider?"
`.trim();
      case 'mixed':
        return `
Interview Type: Mixed (Behavioral + Technical)
Cover both behavioral experiences and technical problem-solving.
Alternate between behavioral and technical topics naturally.
`.trim();
    }
  },
};

// ---- Experience Level Block ----

const EXPERIENCE_LEVEL_BLOCK: PromptBlock = {
  name: 'experience_level',
  applies: () => true,
  render: (ctx) => {
    const level = ctx.config.experienceLevel;
    switch (level) {
      case 'junior':
        return `
Candidate Level: Junior (0-2 years)
Focus on: foundational understanding, learning attitude, growth potential.
Be encouraging. Prioritize exploring what they know rather than what they don't.
Ask about coursework projects, internships, and personal projects.
`.trim();
      case 'mid':
        return `
Candidate Level: Mid-Level (2-5 years)
Focus on: project depth, technical decisions, collaboration, mentoring.
Expect concrete examples from professional experience.
Challenge responses constructively — probe for "why" and "how".
`.trim();
      case 'senior':
        return `
Candidate Level: Senior (5+ years)
Focus on: leadership, architecture, strategic thinking, cross-functional impact.
Ask about systems they designed, teams they led, and difficult decisions.
Challenge their thinking at a strategic level. Probe for depth and breadth.
`.trim();
    }
  },
};

// ---- Candidate Block ----

const CANDIDATE_BLOCK: PromptBlock = {
  name: 'candidate',
  applies: (ctx) => ctx.candidateProfile.name !== 'Candidate',
  render: (ctx) => `
Candidate: ${ctx.candidateProfile.name}
Target Role: ${ctx.candidateProfile.role}
`.trim(),
};

// ---- Topic Block ----

const TOPIC_BLOCK: PromptBlock = {
  name: 'topic',
  applies: (ctx) => ctx.currentTopic !== null,
  render: (ctx) => `
Current topic: ${ctx.currentTopic ?? 'introduction'}
Topics covered: ${ctx.topicHistory.join(', ') || 'none'}
Questions asked: ${ctx.questionCount}/${ctx.config.maxQuestions}
`.trim(),
};

// ---- History Block ----

const HISTORY_BLOCK: PromptBlock = {
  name: 'history',
  applies: (ctx) => ctx.recentHistory.length > 0,
  render: (ctx) => {
    if (ctx.summarizedHistory) {
      return `Previous context: ${ctx.summarizedHistory}`;
    }
    return ctx.recentHistory
      .slice(-4) // Only last 4 turns
      .map(
        (t) => `[Turn ${t.index}]
Interviewer: ${t.interviewer}
Candidate: ${t.candidate}
`,
      )
      .join('\n');
  },
};

// ---- Instruction Block (runtime) ----

const instructionBlock: PromptBlock = {
  name: 'instruction',
  applies: () => true,
  render: (ctx) => {
    const nextTopic = ctx.currentTopic ?? 'the interview topic';
    return `
Current state: You are in the ${ctx.state} phase.
${ctx.followUpDepth > 0 ? `You are on follow-up depth ${ctx.followUpDepth} for the current topic. Explore deeper or transition.` : 'Start a new question on the current topic.'}

Remember: Ask ONE question. Listen fully. Respond naturally.
`.trim();
  },
};

// ---- Prompt Composer ----

const ALL_BLOCKS: PromptBlock[] = [
  SYSTEM_PROMPT,
  INTERVIEW_TYPE_BLOCK,
  EXPERIENCE_LEVEL_BLOCK,
  CANDIDATE_BLOCK,
  TOPIC_BLOCK,
  HISTORY_BLOCK,
  instructionBlock,
];

/**
 * Compose a complete system prompt for the current interview context.
 */
export function composeSystemPrompt(ctx: InterviewContext): string {
  const applicable = ALL_BLOCKS.filter((b) => b.applies(ctx));
  return applicable.map((b) => b.render(ctx)).join('\n\n---\n\n');
}

/**
 * Compose a closing prompt for ending the interview.
 */
export function composeClosingPrompt(ctx: InterviewContext): string {
  const weaknesses = 'communication depth'; // Would come from real-time evaluation

  return `
You are concluding the interview. Thank the candidate for their time.

Briefly acknowledge 1-2 strengths you noticed.
Mention 1 area for growth — constructively.

Keep it to 3-4 sentences. Be warm and professional.

Topics covered: ${ctx.topicHistory.length}
Questions asked: ${ctx.questionCount}
Duration: ~${Math.round((Date.now() - ctx.startedAt.getTime()) / 60000)} minutes
${weaknesses ? `Key growth area: ${weaknesses}` : ''}

Then tell them their feedback report will be ready shortly.
Offer them a moment to ask any questions about the role.
`.trim();
}

// ---- Token Budget Tracking ----

export function estimatePromptTokens(ctx: InterviewContext): number {
  const prompt = composeSystemPrompt(ctx);
  // ~4 chars per token for English text
  return Math.ceil(prompt.length / 4);
}
