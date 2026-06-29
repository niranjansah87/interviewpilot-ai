/**
 * JWT utilities — sign and verify JWTs using jose.
 * All JWT operations go through this module.
 */

import { jwtVerify, SignJWT } from 'jose';
import { getEnv } from '@/config/env';

function getSecret(name: 'JWT_SECRET' | 'JWT_REFRESH_SECRET'): Uint8Array {
  const secret = getEnv()[name];
  return new TextEncoder().encode(secret);
}

export interface TokenPayload {
  sub: string;
  email?: string;
  iat?: number;
  exp?: number;
}

/**
 * Sign a new access token.
 * Default expiry: 15 minutes.
 */
export async function signAccessToken(
  payload: Omit<TokenPayload, 'iat' | 'exp'>,
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(getEnv().JWT_ACCESS_EXPIRY ?? '15m')
    .setSubject(payload.sub)
    .sign(getSecret('JWT_SECRET'));
}

/**
 * Sign a new refresh token.
 * Default expiry: 7 days.
 */
export async function signRefreshToken(
  payload: Omit<TokenPayload, 'iat' | 'exp'>,
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(getEnv().JWT_REFRESH_EXPIRY ?? '7d')
    .setSubject(payload.sub)
    .sign(getSecret('JWT_REFRESH_SECRET'));
}

/**
 * Verify and decode an access token.
 * Throws if expired or invalid.
 */
export async function verifyAccessToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, getSecret('JWT_SECRET'));
  return payload as unknown as TokenPayload;
}

/**
 * Verify and decode a refresh token.
 * Throws if expired or invalid.
 */
export async function verifyRefreshToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, getSecret('JWT_REFRESH_SECRET'));
  return payload as unknown as TokenPayload;
}
