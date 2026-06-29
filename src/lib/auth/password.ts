/**
 * Password hashing using bcrypt.
 * Uses cost factor 12 — CPU-intensive, secure against brute force.
 */

import bcrypt from 'bcrypt';

const BCRYPT_ROUNDS = 12;

/**
 * Hash a plain-text password.
 * Use for storing new passwords or changing passwords.
 */
export async function hashPassword(plain: string): Promise<string> {
  if (plain.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

/**
 * Verify a plain-text password against a stored hash.
 * Use for login and password comparison.
 */
export async function verifyPassword(
  plain: string,
  hashed: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}
