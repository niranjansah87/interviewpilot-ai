/**
 * Role constants.
 */

export const ROLE_USER = 'user' as const;
export const ROLE_ADMIN = 'admin' as const;

export type UserRole = typeof ROLE_USER | typeof ROLE_ADMIN;

export const USER_ROLES: UserRole[] = [ROLE_USER, ROLE_ADMIN];
