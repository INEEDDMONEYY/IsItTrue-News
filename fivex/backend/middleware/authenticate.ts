import type { NextFunction, Request, Response } from 'express'
import { ACCESS_TOKEN_COOKIE } from '../utils/cookies.js'
import { verifyAccessToken } from '../security/tokens.js'
import { AppError } from '../shared/errors/AppError.js'
import type { Role } from '../shared/constants/roles.js'

export interface AuthenticatedUser {
  id: string
  email: string
  role: Role
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser
    }
  }
}

function extractToken(req: Request): string | undefined {
  const cookieToken = req.cookies?.[ACCESS_TOKEN_COOKIE]
  if (cookieToken) return cookieToken

  const header = req.headers.authorization
  if (header?.startsWith('Bearer ')) {
    return header.slice('Bearer '.length)
  }

  return undefined
}

/**
 * Verifies the access token (cookie or Authorization header) and attaches the
 * decoded identity to req.user. Must run before any authorize(...) middleware.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const token = extractToken(req)

  if (!token) {
    next(new AppError('You must be signed in to access this resource.', 401))
    return
  }

  try {
    const payload = verifyAccessToken(token)
    req.user = { id: payload.sub, email: payload.email, role: payload.role }
    next()
  } catch {
    next(new AppError('Your session has expired. Please sign in again.', 401))
  }
}

/**
 * Like `authenticate`, but never rejects the request — it just attaches
 * req.user when a valid token is present and moves on otherwise. Used for
 * routes that are publicly readable but behave differently for a signed-in
 * owner/editor/admin (e.g. viewing an article that may still be a draft).
 */
export function optionalAuthenticate(req: Request, _res: Response, next: NextFunction): void {
  const token = extractToken(req)
  if (!token) {
    next()
    return
  }

  try {
    const payload = verifyAccessToken(token)
    req.user = { id: payload.sub, email: payload.email, role: payload.role }
  } catch {
    // Invalid/expired token on an optional route — treat as anonymous.
  }
  next()
}
