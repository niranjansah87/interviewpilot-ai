/**
 * Structured logger using Pino.
 * All application logging goes through this module.
 * Never use console.log in application code.
 */

import pino from 'pino';

const isDevelopment = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

export { pino };

/**
 * Base logger instance.
 * Child loggers are created per-request with request context.
 */
export const logger = pino({
  level: process.env.LOG_LEVEL ?? (isTest ? 'silent' : 'info'),
  ...(isDevelopment
    ? {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        },
      }
    : {}),
});

/**
 * Create a child logger with additional context fields.
 * Use for request-scoped logging.
 */
export function createRequestLogger(context: Record<string, unknown>) {
  return logger.child(context);
}

/**
 * Create a child logger for a specific service or module.
 */
export function createServiceLogger(service: string) {
  return logger.child({ service });
}

/**
 * Log levels:
 * - fatal: system is unusable (not used in app code)
 * - error: errors that need attention
 * - warn:  warnings (rate limits, degraded states)
 * - info:  significant events (user actions, state changes)
 * - debug: detailed diagnostic info (dev only)
 * - trace: very detailed (never in production)
 */
export const log = {
  fatal: (msg: string, extra?: Record<string, unknown>) =>
    logger.fatal({ ...extra, msg }),
  error: (msg: string, extra?: Record<string, unknown>) =>
    logger.error({ ...extra, msg }),
  warn: (msg: string, extra?: Record<string, unknown>) =>
    logger.warn({ ...extra, msg }),
  info: (msg: string, extra?: Record<string, unknown>) =>
    logger.info({ ...extra, msg }),
  debug: (msg: string, extra?: Record<string, unknown>) =>
    logger.debug({ ...extra, msg }),
  trace: (msg: string, extra?: Record<string, unknown>) =>
    logger.trace({ ...extra, msg }),
};
