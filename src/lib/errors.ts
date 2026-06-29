/**
 * Application-level error hierarchy.
 * All application errors extend ApplicationError.
 * Errors are typed, serializable, and carry context for logging.
 */

export class ApplicationError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    code: string,
    statusCode: number,
    isOperational = true,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
    };
  }
}

/**
 * Thrown when input fails Zod/validation schema validation.
 */
export class ValidationError extends ApplicationError {
  public readonly field?: string;

  constructor(message: string, field?: string) {
    super(message, 'VALIDATION_ERROR', 422);
    this.field = field;
    this.name = 'ValidationError';
  }

  override toJSON() {
    return { ...super.toJSON(), field: this.field };
  }
}

/**
 * Thrown when authentication fails (invalid credentials, expired token).
 */
export class AuthenticationError extends ApplicationError {
  constructor(message = 'Authentication required') {
    super(message, 'UNAUTHORIZED', 401);
    this.name = 'AuthenticationError';
  }
}

/**
 * Thrown when the user lacks permission for an action.
 */
export class AuthorizationError extends ApplicationError {
  constructor(message = 'You do not have permission to perform this action') {
    super(message, 'FORBIDDEN', 403);
    this.name = 'AuthorizationError';
  }
}

/**
 * Thrown when a requested resource is not found.
 */
export class NotFoundError extends ApplicationError {
  constructor(resource = 'Resource', identifier?: string) {
    const message = identifier
      ? `${resource} '${identifier}' not found`
      : `${resource} not found`;
    super(message, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

/**
 * Thrown when a conflict occurs (duplicate email, etc.)
 */
export class ConflictError extends ApplicationError {
  constructor(message = 'A resource with that identifier already exists') {
    super(message, 'CONFLICT', 409);
    this.name = 'ConflictError';
  }
}

/**
 * Thrown when a service (database, AI provider, etc.) is unavailable.
 */
export class InfrastructureError extends ApplicationError {
  constructor(
    message: string,
    code = 'INFRASTRUCTURE_ERROR',
    statusCode = 503,
  ) {
    super(message, code, statusCode, false);
    this.name = 'InfrastructureError';
  }
}

/**
 * Thrown when an AI provider (OpenAI, etc.) returns an error.
 */
export class AIProviderError extends ApplicationError {
  public readonly provider: string;
  public readonly retryable: boolean;

  constructor(
    message: string,
    provider: string,
    retryable = false,
  ) {
    super(message, 'AI_PROVIDER_ERROR', 502, true);
    this.provider = provider;
    this.retryable = retryable;
    this.name = 'AIProviderError';
  }

  override toJSON() {
    return { ...super.toJSON(), provider: this.provider, retryable: this.retryable };
  }
}

/**
 * Thrown when a rate limit is exceeded.
 */
export class RateLimitError extends ApplicationError {
  public readonly retryAfterSeconds?: number;

  constructor(retryAfterSeconds?: number) {
    super('Too many requests. Please try again later.', 'RATE_LIMITED', 429);
    this.retryAfterSeconds = retryAfterSeconds;
    this.name = 'RateLimitError';
  }

  override toJSON() {
    return { ...super.toJSON(), retryAfterSeconds: this.retryAfterSeconds };
  }
}

/**
 * Type guard: returns true if the error is an operational (expected) error.
 */
export function isOperationalError(error: unknown): error is ApplicationError {
  return error instanceof ApplicationError && error.isOperational === true;
}
