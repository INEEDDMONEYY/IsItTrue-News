import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import type { Role } from '../shared/constants/roles.js'

export interface AccessTokenPayload {
  sub: string
  email: string
  role: Role
}

export interface RefreshTokenPayload {
  sub: string
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'] })
}

/**
 * The refresh token is an idle timeout: it is re-issued on every refresh, so it
 * only expires after this long without activity.
 */
export const REFRESH_TOKEN_IDLE_TIMEOUT_MS = 60 * 60 * 1000

export function signRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_IDLE_TIMEOUT_MS / 1000 })
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload
}
