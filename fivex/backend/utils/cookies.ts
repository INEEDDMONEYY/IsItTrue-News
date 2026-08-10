import type { Response } from 'express'
import { isProduction } from '../config/env.js'

export const ACCESS_TOKEN_COOKIE = 'access_token'
export const REFRESH_TOKEN_COOKIE = 'refresh_token'

const ACCESS_TOKEN_MAX_AGE_MS = 15 * 60 * 1000
const REFRESH_TOKEN_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000

/**
 * Cross-site cookies (frontend/backend on different domains, e.g. in production
 * behind Render) require sameSite "none" + secure. Same-origin local dev (via the
 * Vite proxy) works fine with the more restrictive "lax" over plain http.
 */
const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
  path: '/',
}

export function setAuthCookies(res: Response, tokens: { accessToken: string; refreshToken: string }): void {
  res.cookie(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    ...cookieOptions,
    maxAge: ACCESS_TOKEN_MAX_AGE_MS,
  })
  res.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    ...cookieOptions,
    maxAge: REFRESH_TOKEN_MAX_AGE_MS,
  })
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie(ACCESS_TOKEN_COOKIE, cookieOptions)
  res.clearCookie(REFRESH_TOKEN_COOKIE, cookieOptions)
}
