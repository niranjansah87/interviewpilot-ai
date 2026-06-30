/**
 * Shared Zod validation schemas.
 * Import these from validators/common.
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

export const emailSchema = z.string().email('Invalid email address');
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be at most 128 characters');
export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(200, 'Name must be at most 200 characters');

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema.optional(),
});

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
});

// ---------------------------------------------------------------------------
// Common
// ---------------------------------------------------------------------------

export const uuidSchema = z.string().uuid('Invalid ID format');
export const unixTimestampSchema = z.number().int().positive();

export const idParamsSchema = z.object({
  id: uuidSchema,
});

export const cursorSchema = z.object({
  cursor: uuidSchema.optional(),
  limit: z.coerce.number().int().positive().max(50).default(10),
});

// ---------------------------------------------------------------------------
// AI-safe text — prevents prompt injection in dynamic variables
// ---------------------------------------------------------------------------

/** Reject newlines and control characters to prevent prompt breakout. */
const SAFE_TEXT_PATTERN = /^[a-zA-Z0-9 .,'\-+#/()&]+$/;

export const safeTextField = z
  .string()
  .max(100, 'Must be 100 characters or fewer')
  .regex(SAFE_TEXT_PATTERN, 'Contains invalid characters')
  .optional();
