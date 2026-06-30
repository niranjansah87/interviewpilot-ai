/**
 * Client-side API error handler.
 * Transforms raw fetch errors into user-friendly messages.
 */

export type ErrorCategory =
  | 'network'      // Internet connection issues
  | 'auth'         // Login/register/token errors
  | 'validation'   // Form validation errors
  | 'server'       // 5xx errors
  | 'rate_limit'   // 429
  | 'voice'        // ElevenLabs/OpenAI issues
  | 'timeout'      // Request timed out
  | 'unknown';

export interface HandledError {
  message: string;
  category: ErrorCategory;
  retryable: boolean;
  originalError?: unknown;
}

/** Main error handler — call this from every catch block */
export function handleError(error: unknown): HandledError {
  // Network offline
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return { message: 'No internet connection. Please check your network.', category: 'network', retryable: true };
  }

  // Fetch Response errors
  if (error instanceof Response || (error as { status?: number }).status) {
    const status = (error as { status: number }).status;
    const body = (error as { detail?: string; code?: string }).detail ?? '';

    if (status === 401) return { message: 'Session expired. Please sign in again.', category: 'auth', retryable: false };
    if (status === 403) return { message: 'You do not have access to this resource.', category: 'auth', retryable: false };
    if (status === 404) return { message: 'The requested resource was not found.', category: 'server', retryable: false };
    if (status === 409) return { message: body || 'This already exists.', category: 'validation', retryable: false };
    if (status === 422) return { message: body || 'Please check your input.', category: 'validation', retryable: false };
    if (status === 429) return { message: 'Too many requests. Please wait a moment.', category: 'rate_limit', retryable: true };
    if (status === 502 || status === 503) return { message: 'Service temporarily unavailable. Retrying...', category: 'voice', retryable: true };
    if (status >= 500) return { message: 'Server error. Our team has been notified.', category: 'server', retryable: true };
    if (status >= 400) return { message: body || 'Request failed. Please try again.', category: 'server', retryable: true };
  }

  // Error instances
  if (error instanceof Error) {
    const msg = error.message;
    if (msg.includes('quota') || msg.includes('exceeded')) return { message: 'AI service quota exceeded. Please try again later.', category: 'voice', retryable: true };
    if (msg.includes('timeout') || msg.includes('timed out')) return { message: 'Request timed out. Please try again.', category: 'timeout', retryable: true };
    if (msg.includes('WebSocket')) return { message: 'Voice connection issue. Please reconnect.', category: 'voice', retryable: true };
    if (msg.includes('microphone') || msg.includes('Microphone')) return { message: msg, category: 'voice', retryable: false };
    if (msg.includes('credentials') || msg.includes('password') || msg.includes('email')) return { message: msg, category: 'auth', retryable: false };
    return { message: msg, category: 'unknown', retryable: true };
  }

  return { message: 'Something went wrong. Please try again.', category: 'unknown', retryable: true };
}

/** Get user-friendly title for error category */
export function getErrorTitle(category: ErrorCategory): string {
  switch (category) {
    case 'network': return 'Connection Lost';
    case 'auth': return 'Sign In Required';
    case 'validation': return 'Invalid Input';
    case 'server': return 'Server Error';
    case 'rate_limit': return 'Too Many Requests';
    case 'voice': return 'Voice Service Issue';
    case 'timeout': return 'Request Timeout';
    case 'unknown': return 'Something Went Wrong';
  }
}
