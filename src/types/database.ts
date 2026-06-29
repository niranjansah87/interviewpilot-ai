/**
 * Database model types (mirrors Prisma schema).
 * These are the canonical DB-facing types.
 */

export type InterviewStatus = 'created' | 'ready' | 'active' | 'completed' | 'failed';
export type InterviewType = 'behavioral' | 'technical' | 'mixed';
export type ExperienceLevel = 'junior' | 'mid' | 'senior';
export type TranscriptRole = 'interviewer' | 'candidate';

export interface UserModel {
  id: string;
  email: string;
  passwordHash: string;
  name: string | null;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export interface InterviewSessionModel {
  id: string;
  userId: string;
  type: InterviewType;
  targetRole: string | null;
  experienceLevel: ExperienceLevel | null;
  status: InterviewStatus;
  startedAt: Date | null;
  endedAt: Date | null;
  durationSeconds: number | null;
  createdAt: Date;
}

export interface TranscriptEntryModel {
  id: string;
  sessionId: string;
  role: TranscriptRole;
  content: string;
  audioUrl: string | null;
  createdAt: Date;
}

export interface FeedbackReportModel {
  id: string;
  sessionId: string;
  overallScore: number;
  communicationScore: number;
  confidenceScore: number;
  technicalReasoning: number | null;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  summary: string;
  createdAt: Date;
}

export interface RefreshTokenModel {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  revoked: boolean;
  createdAt: Date;
}
