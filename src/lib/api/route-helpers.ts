/**
 * API route helper utilities.
 * Standardizes error handling and response formatting for all route handlers.
 */

import { NextResponse } from 'next/server';
import { ApplicationError, isOperationalError } from '@/lib/errors';
import { generateRequestId } from '@/lib/request-id';
import { logger } from '@/monitoring/logger';

export function apiSuccess<T>(data: T, status = 200) {
  const requestId = generateRequestId();
  return NextResponse.json(
    { data, requestId, timestamp: new Date().toISOString() },
    { status },
  );
}

export function apiEmpty(status = 204) {
  return new NextResponse(null, { status });
}

export function apiError(error: unknown) {
  if (error instanceof ApplicationError) {
    return NextResponse.json(
      {
        detail: error.message,
        code: error.code,
        ...(error instanceof ValidationError ? { field: error.field } : {}),
      },
      { status: error.statusCode },
    );
  }

  const requestId = generateRequestId();
  const errMsg = error instanceof Error ? error.message : String(error);
  logger.error({ msg: 'Unhandled API error', requestId, error: errMsg });

  return NextResponse.json(
    {
      detail: 'An unexpected error occurred',
      code: 'INTERNAL_ERROR',
      requestId,
    },
    { status: 500 },
  );
}

// Re-export ValidationError for convenience
import { ValidationError } from '@/lib/errors';
export { ValidationError };
