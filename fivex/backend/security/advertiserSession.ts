import { createHmac } from 'node:crypto'
import type { Response } from 'express'
import jwt from 'jsonwebtoken'
import { env, isProduction } from '../config/env.js'

export const ADVERTISER_SESSION_COOKIE = 'advertiser_session'

const SESSION_DAYS = 7
const SESSION_MAX_AGE_MS = SESSION_DAYS * 24 * 60 * 60 * 1000
const ISSUER = 'isittrue-news'
const AUDIENCE = 'advertiser'

// A key of its own, so a token signed for a reader/author/editor/admin can never verify as an advertiser
// session (or the reverse), even if someone presents one where the other is expected.
const signingKey: string =
  env.JWT_ADVERTISER_SECRET ??
  createHmac('sha256', env.JWT_ACCESS_SECRET).update('isittrue:advertiser-session:v1').digest('hex')

export interface AdvertiserSessionPayload {
  sub: string
  // Seconds since the epoch, added by jwt.sign.
  iat: number
}

export function signAdvertiserSession(advertiserId: string): string {
  return jwt.sign({}, signingKey, {
    subject: advertiserId,
    issuer: ISSUER,
    audience: AUDIENCE,
    expiresIn: `${SESSION_DAYS}d`,
    algorithm: 'HS256',
  })
}

export function verifyAdvertiserSession(token: string): AdvertiserSessionPayload {
  const payload = jwt.verify(token, signingKey, {
    issuer: ISSUER,
    audience: AUDIENCE,
    algorithms: ['HS256'],
  })
  if (typeof payload === 'string' || !payload.sub || typeof payload.iat !== 'number') {
    throw new Error('Malformed advertiser session.')
  }
  return { sub: payload.sub, iat: payload.iat }
}

// Same cross-site rules as the reader cookies: "none" + secure when the site and API are on different
// domains (production), "lax" over plain http for local development.
const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
  path: '/',
}

export function setAdvertiserSessionCookie(res: Response, advertiserId: string): void {
  res.cookie(ADVERTISER_SESSION_COOKIE, signAdvertiserSession(advertiserId), {
    ...cookieOptions,
    maxAge: SESSION_MAX_AGE_MS,
  })
}

export function clearAdvertiserSessionCookie(res: Response): void {
  res.clearCookie(ADVERTISER_SESSION_COOKIE, cookieOptions)
}
