/**
 * Request and trace ID generation.
 */

import { randomBytes } from 'node:crypto';

/**
 * Generates a cryptographically random request ID.
 * Format: `req_${timestamp}_${random_hex}`
 */
export function generateRequestId(): string {
  const timestamp = Date.now().toString(36);
  const random = randomBytes(8).toString('hex');
  return `req_${timestamp}_${random}`;
}

/**
 * Extracts or generates a request ID from incoming headers.
 */
export function getRequestId(headers: Headers): string {
  return headers.get('x-request-id') ?? generateRequestId();
}

/**
 * Trace ID for distributed tracing (correlates across services).
 */
export function generateTraceId(): string {
  return randomBytes(16).toString('hex');
}
