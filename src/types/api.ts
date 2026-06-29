/**
 * API-level types — requests and responses.
 * These types define the API contract.
 */

import type { PaginatedResult } from './common';
import type {
  User,
  AuthTokens,
  LoginInput,
  RegisterInput,
} from './auth';
import type {
  InterviewSessionModel,
  FeedbackReportModel,
  TranscriptEntryModel,
} from './database';

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export interface AuthRegisterResponse {
  user: Pick<User, 'id' | 'email' | 'name'>;
}

export interface AuthLoginResponse extends AuthTokens {
  user: Pick<User, 'id' | 'email' | 'name'>;
}

export interface AuthRefreshResponse {
  user: Pick<User, 'id' | 'email' | 'name'>;
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export interface GetMeResponse {
  user: User;
}

export interface UpdateMeRequest {
  name?: string;
}

// ---------------------------------------------------------------------------
// Interviews
// ---------------------------------------------------------------------------

export interface CreateInterviewRequest {
  type: string;
  targetRole?: string;
  experienceLevel?: string;
}

export interface GetInterviewsResponse
  extends PaginatedResult<InterviewSessionModel> {}

export interface GetInterviewResponse {
  interview: InterviewSessionModel;
}

export interface DeleteInterviewResponse {
  deleted: boolean;
}

// ---------------------------------------------------------------------------
// Transcripts
// ---------------------------------------------------------------------------

export interface GetTranscriptResponse {
  sessionId: string;
  entries: TranscriptEntryModel[];
}

// ---------------------------------------------------------------------------
// Feedback
// ---------------------------------------------------------------------------

export interface GetFeedbackResponse {
  report: FeedbackReportModel;
}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export interface ApiErrorResponse {
  detail: string;
  code: string;
  field?: string;
  requestId?: string;
}
