import type { NextFunction, Request, Response } from 'express'
import { ADVERTISER_SESSION_COOKIE, verifyAdvertiserSession } from '../security/advertiserSession.js'
import { AppError } from '../shared/errors/AppError.js'
import { ADVERTISER_STATUSES, type AdvertiserStatus } from '../modules/advertisers/constants/advertiser.js'
import { advertiserRepository } from '../modules/advertisers/repositories/advertiser.repository.js'

export interface AuthenticatedAdvertiser {
  id: string
  email: string
  status: AdvertiserStatus
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      advertiser?: AuthenticatedAdvertiser
    }
  }
}

const SIGN_IN_AGAIN = 'Your session has expired. Please sign in again.'

/**
 * Guards advertiser-only routes. Deliberately separate from `authenticate`: it reads only the advertiser
 * session cookie (never the reader cookie or an Authorization header), verifies it with the advertiser key,
 * and then checks the account itself, so a suspended advertiser or a session from before a password change
 * stops working immediately rather than when the token happens to expire.
 */
export async function authenticateAdvertiser(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.cookies?.[ADVERTISER_SESSION_COOKIE]
    if (typeof token !== 'string' || !token) {
      throw new AppError('You must be signed in to access this resource.', 401)
    }

    let payload
    try {
      payload = verifyAdvertiserSession(token)
    } catch {
      throw new AppError(SIGN_IN_AGAIN, 401)
    }

    const advertiser = await advertiserRepository.findById(payload.sub)
    if (!advertiser) {
      throw new AppError(SIGN_IN_AGAIN, 401)
    }

    // A password change invalidates every earlier session. iat is in whole seconds, so compare at that grain.
    if (advertiser.passwordChangedAt && payload.iat < Math.floor(advertiser.passwordChangedAt.getTime() / 1000)) {
      throw new AppError(SIGN_IN_AGAIN, 401)
    }

    if (advertiser.status === ADVERTISER_STATUSES.SUSPENDED) {
      throw new AppError('This advertiser account has been suspended.', 403)
    }
    if (!advertiser.isEmailVerified) {
      throw new AppError('Please verify your email address before continuing.', 403)
    }

    req.advertiser = { id: String(advertiser._id), email: advertiser.email, status: advertiser.status }
    next()
  } catch (error) {
    next(error)
  }
}
