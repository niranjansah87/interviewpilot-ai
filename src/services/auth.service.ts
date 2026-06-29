/**
 * Authentication service — business logic for registration, login, logout.
 */

import { createHash } from 'node:crypto';
import { userRepository } from '@/repositories/user.repository';
import { refreshTokenRepository } from '@/repositories/refresh-token.repository';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '@/lib/auth/jwt';
import { ConflictError, AuthenticationError } from '@/lib/errors';
import { getEnv } from '@/config/env';
import { logger } from '@/monitoring/logger';

/** Hash a token for storage — SHA-256, one-way, safe to persist. */
function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

const authLogger = logger.child({ service: 'auth' });

export const authService = {
  /**
   * Register a new user.
   */
  async register(input: { email: string; password: string; name?: string }) {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError('A user with this email already exists');
    }

    const passwordHash = await hashPassword(input.password);
    const user = await userRepository.create({
      email: input.email,
      passwordHash,
      name: input.name,
    });

    authLogger.info({ msg: 'User registered', userId: user.id });
    return { id: user.id, email: user.email, name: user.name };
  },

  /**
   * Login — validate credentials and return tokens.
   */
  async login(input: { email: string; password: string }) {
    const user = await userRepository.findByEmail(input.email);
    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    const valid = await verifyPassword(input.password, user.passwordHash);
    if (!valid) {
      throw new AuthenticationError('Invalid email or password');
    }

    const tokenPayload = { sub: user.id, email: user.email };
    const env = getEnv();
    const accessToken = await signAccessToken(tokenPayload);
    const refreshToken = await signRefreshToken(tokenPayload);

    // Store SHA-256 hash of refresh token for revocation lookup
    const tokenHash = hashToken(refreshToken);
    await refreshTokenRepository.create(user.id, tokenHash, 7 * 24 * 60 * 60);

    authLogger.info({ msg: 'User logged in', userId: user.id });

    return {
      user: { id: user.id, email: user.email, name: user.name },
      accessToken,
      refreshToken,
      tokenType: 'Bearer' as const,
    };
  },

  /**
   * Refresh tokens using a valid refresh token.
   */
  async refresh(token: string) {
    const payload = await verifyRefreshToken(token);
    const tokenHash = hashToken(token);
    const stored = await refreshTokenRepository.findByHash(tokenHash);

    if (!stored) {
      throw new AuthenticationError('Invalid or expired refresh token');
    }

    // Revoke old token
    await refreshTokenRepository.revoke(stored.id);

    const tokenPayload = { sub: payload.sub, email: payload.email };
    const accessToken = await signAccessToken(tokenPayload);
    const newRefreshToken = await signRefreshToken(tokenPayload);

    // Store SHA-256 hash of new refresh token
    const newHash = hashToken(newRefreshToken);
    await refreshTokenRepository.create(payload.sub, newHash, 7 * 24 * 60 * 60);

    const user = await userRepository.findById(payload.sub);

    return {
      user: { id: user?.id ?? payload.sub, email: user?.email ?? payload.email, name: user?.name },
      accessToken,
      refreshToken: newRefreshToken,
      tokenType: 'Bearer' as const,
    };
  },

  /**
   * Logout — revoke all refresh tokens for the user.
   */
  async logout(token: string) {
    try {
      const payload = await verifyRefreshToken(token);
      await refreshTokenRepository.revokeAllForUser(payload.sub);
      authLogger.info({ msg: 'User logged out', userId: payload.sub });
    } catch {
      // Token already expired — logout is still successful
    }
  },
};
