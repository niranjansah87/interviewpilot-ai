/**
 * CSRF token generation and validation.
 * Uses double-submit cookie pattern.
 */

import { createCipheriv, randomBytes, createDecipheriv } from 'node:crypto';

/** Cookie-based CSRF token — signed, not encrypted. */

const CSRF_SECRET = Buffer.from(
  process.env.JWT_SECRET ?? 'development-secret-32-chars-minimum!!',
  'utf8',
).slice(0, 32);

const ALGORITHM = 'aes-256-gcm';

/**
 * Generate a new CSRF token.
 * Returns the token and the signature.
 */
export function generateCsrfToken(): { token: string; signature: string } {
  const token = randomBytes(16).toString('hex');
  const signature = signCsrf(token);
  return { token, signature };
}

/**
 * Sign a CSRF token.
 */
function signCsrf(token: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, CSRF_SECRET, iv);
  const encrypted = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('base64url');
}

/**
 * Verify a CSRF token + signature.
 */
export function verifyCsrfToken(token: string, signature: string): boolean {
  try {
    const buf = Buffer.from(signature, 'base64url');
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const encrypted = buf.subarray(28);
    const decipher = createDecipheriv(ALGORITHM, CSRF_SECRET, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('hex');
    return decrypted === token;
  } catch {
    return false;
  }
}

/**
 * Generate both the cookie value (for setting) and the header value (for sending).
 */
export function createCsrfPair(): {
  cookieValue: string;
  headerValue: string;
  signature: string;
} {
  const { token, signature } = generateCsrfToken();
  return {
    cookieValue: token,
    headerValue: `${token}.${signature}`,
    signature,
  };
}
