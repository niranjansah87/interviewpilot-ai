/**
 * Structured logger using Pino v10.
 * All application logging goes through this module.
 * Never use console.log in application code.
 */

import pino from 'pino';

const isDevelopment = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

export { pino };

/**
 * Base logger instance.
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
 * Log helpers using Pino v10 object-first API.
 */
export const log = {
  info: (msg: string, extra?: Record<string, unknown>) =>
    logger.info({ ...extra, msg }),
  error: (msg: string, extra?: Record<string, unknown>) =>
    logger.error({ ...extra, msg }),
  warn: (msg: string, extra?: Record<string, unknown>) =>
    logger.warn({ ...extra, msg }),
  debug: (msg: string, extra?: Record<string, unknown>) =>
    logger.debug({ ...extra, msg }),
};
