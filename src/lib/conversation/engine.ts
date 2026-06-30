/**
 * Conversation Engine — owns the interview flow and state machine.
 * The LLM generates language; the engine owns business logic.
 *
 * Every interview progresses through states:
 *   IDLE → INITIALIZING → LISTENING → PROCESSING → RESPONDING → ...
 *   ... → COMPLETED (or FAILED)
 */

// ---- State Machine ----

export type ConversationState =
  | 'idle'
  | 'initializing'
  | 'listening'
  | 'processing'
  | 'responding'
  | 'completing'
  | 'completed'
  | 'failed';

export type ConversationEvent =
  | 'start'
  | 'connected'
  | 'speech_started'
  | 'speech_stopped'
  | 'response_started'
  | 'response_completed'
  | 'follow_up_needed'
  | 'topics_exhausted'
  | 'timeout'
  | 'error'
  | 'end';

// State transition table: [currentState][event] → nextState
const TRANSITIONS: Record<ConversationState, Partial<Record<ConversationEvent, ConversationState>>> = {
  idle:          { start: 'initializing' },
  initializing:  { connected: 'listening', error: 'failed' },
  listening:     { speech_started: 'listening', speech_stopped: 'processing', timeout: 'completing', error: 'failed', connected: 'listening' },
  processing:    { response_started: 'responding', speech_stopped: 'processing', error: 'failed' },
  responding:    { response_completed: 'listening', speech_started: 'processing', timeout: 'completing', error: 'failed' },
  completing:    { end: 'completed', error: 'failed' },
  completed:     {},
  failed:        { start: 'initializing' },
};

export function transition(current: ConversationState, event: ConversationEvent): ConversationState {
  const next = TRANSITIONS[current]?.[event];
  if (!next) {
    // Graceful: return current state for unknown transitions
    // Prevents crashes during race conditions (e.g., speech_stopped during processing)
    return current;
  }
  return next;
}

// ---- Context Management ----

export interface InterviewContext {
  sessionId: string;
  config: InterviewConfig;
  state: ConversationState;
  currentTopic: string | null;
  topicHistory: string[];
  questionCount: number;
  turnCount: number;
  startedAt: Date;
  lastActivityAt: Date;
  candidateProfile: CandidateProfile;
  recentHistory: ConversationTurn[];
  summarizedHistory: string | null;
  followUpDepth: number;
  silenceCount: number;
  difficulty: DifficultyLevel;
  /** Score of the candidate's last response (estimated by engine, 0-100) */
  lastResponseScore: number | null;
}

export interface InterviewConfig {
  type: 'behavioral' | 'technical' | 'mixed';
  targetRole: string;
  experienceLevel: 'junior' | 'mid' | 'senior';
  maxDurationSeconds: number;
  maxQuestions: number;
}

export interface CandidateProfile {
  name: string;
  level: string;
  role: string;
}

export interface ConversationTurn {
  index: number;
  interviewer: string;
  candidate: string;
  timestamp: Date;
}

// ---- Interview Config Factory ----

export function createInterviewContext(
  sessionId: string,
  config: InterviewConfig,
  candidateName = 'Candidate',
): InterviewContext {
  return {
    sessionId,
    config,
    state: 'idle',
    currentTopic: null,
    topicHistory: [],
    questionCount: 0,
    turnCount: 0,
    startedAt: new Date(),
    lastActivityAt: new Date(),
    candidateProfile: { name: candidateName, level: config.experienceLevel, role: config.targetRole },
    recentHistory: [],
    summarizedHistory: null,
    followUpDepth: 0,
    silenceCount: 0,
    difficulty: config.experienceLevel === 'senior' ? 4 : config.experienceLevel === 'mid' ? 3 : 2,
    lastResponseScore: null,
  };
}

// ---- Topic Configuration ----

function getTopicsByType(type: InterviewConfig['type']): string[] {
  switch (type) {
    case 'behavioral':
      return ['introduction', 'teamwork', 'leadership', 'conflict_resolution', 'failure_recovery', 'career_growth'];
    case 'technical':
      return ['introduction', 'system_design', 'problem_solving', 'trade_offs', 'past_projects', 'technical_depth'];
    case 'mixed':
      return ['introduction', 'teamwork', 'system_design', 'leadership', 'problem_solving', 'career_growth'];
  }
}

// ---- Difficulty Scaling ----

export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

export function adjustDifficulty(
  score: number,
  current: DifficultyLevel,
): DifficultyLevel {
  // Score 0-100: <40 = decrease, 40-70 = maintain, >70 = increase
  if (score < 40 && current > 1) return (current - 1) as DifficultyLevel;
  if (score > 70 && current < 5) return (current + 1) as DifficultyLevel;
  return current;
}

export function getDifficultyLabel(d: DifficultyLevel): string {
  switch (d) {
    case 1: return 'foundational';
    case 2: return 'intermediate';
    case 3: return 'advanced';
    case 4: return 'expert';
    case 5: return 'principal';
  }
}

// ---- Follow-Up Decision Engine ----

export type FollowUpDecision =
  | 'clarify'      // Response vague — ask for more
  | 'probe_deeper'  // Good response — explore further
  | 'challenge'    // Flawed response — push back
  | 'acknowledge'  // Strong — move forward
  | 'transition'   // Topic exhausted — next topic
  | 'conclude';    // All topics covered — end

export function decideFollowUp(ctx: InterviewContext): FollowUpDecision {
  // Decision rules (deterministic, not AI-based):
  // 1. If silence > 2x, suggest conclusion
  // 2. If followUpDepth >= 2 on same topic, transition
  // 3. If questionCount >= maxQuestions, conclude
  // 4. If topics remaining <= 0, conclude
  // 5. Default: probe deeper

  if (ctx.silenceCount >= 2) return 'conclude';
  if (ctx.questionCount >= ctx.config.maxQuestions) return 'conclude';

  const topics = getTopicsByType(ctx.config.type);
  const remainingTopics = topics.filter((t) => !ctx.topicHistory.includes(t));

  if (remainingTopics.length === 0) return 'conclude';
  if (ctx.followUpDepth >= 2) return 'transition';

  // Behavior: probe deeper on first pass, transition on second
  if (ctx.followUpDepth === 0)
    return Math.random() > 0.3 ? 'probe_deeper' : 'acknowledge';

  return 'acknowledge';
}

export function selectNextTopic(ctx: InterviewContext): string {
  const covered = new Set(ctx.topicHistory);
  const topics = getTopicsByType(ctx.config.type);
  const remaining = topics.filter((t) => !covered.has(t));

  if (remaining.length === 0) return 'closing';

  return remaining[0] ?? 'closing';
}

// ---- Follow-Up Style Patterns ----

const STYLES: Record<FollowUpDecision, string[]> = {
  clarify: [
    'Can you elaborate on that?',
    'Could you give me a specific example?',
    'Help me understand — what exactly happened there?',
    'Walk me through your reasoning on that point.',
  ],
  probe_deeper: [
    'What trade-offs did you consider?',
    'What was the hardest part of that decision?',
    'If you had to do it again, what would you change?',
    'How did you validate that approach?',
    'What risks did you accept with that design?',
  ],
  challenge: [
    'I understand your reasoning, but what if the constraints were different?',
    'Suppose that assumption was wrong — how would you recover?',
    'Can you defend that choice against the alternative?',
    'What if you had 10x the scale — would your solution hold?',
  ],
  acknowledge: [
    'That is a well-reasoned answer. Let us explore another area.',
    'I appreciate that perspective. Let me shift to a different topic.',
    'Good. Let us move on to something related.',
  ],
  transition: [
    'Let us shift gears. I would like to hear about...',
    'Changing topics — tell me about...',
    'Moving on — I am curious about your experience with...',
  ],
  conclude: [
    'Thank you — that gives me a clear picture. We have covered a lot of ground today.',
    'I think we have a good foundation. Let me wrap up with a final question.',
    'Before we finish, I have one last topic I would like to explore.',
  ],
};

/** Get a natural-language follow-up opener for a decision type. */
export function getFollowUpStyle(decision: FollowUpDecision): string {
  const pool = STYLES[decision];
  return pool[Math.floor(Math.random() * pool.length)] ?? '';
}

// ---- Token Estimation ----

export function estimateContextTokens(ctx: InterviewContext): number {
  // Rough estimate: ~1.3 tokens per English word, ~4 chars per token
  let chars = 0;
  for (const turn of ctx.recentHistory) {
    chars += turn.interviewer.length + turn.candidate.length;
  }
  return Math.ceil(chars / 4);
}
