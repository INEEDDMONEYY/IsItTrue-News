import { createHash, timingSafeEqual } from 'node:crypto'
import { env } from '../../../config/env.js'
import { logger } from '../../../config/logger.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { mailService } from '../../../mail/mail.service.js'
import { WaitlistSignup } from '../models/WaitlistSignup.js'
import type { JoinWaitlistInput } from '../validations/prelaunch.validation.js'

const DUPLICATE_KEY_ERROR = 11000

function sha256(value: string): Buffer {
  return createHash('sha256').update(value).digest()
}

function isDuplicateKeyError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && (error as { code?: number }).code === DUPLICATE_KEY_ERROR
}

export const prelaunchService = {
  // Always resolves the same way whether or not the address was already on the list, so the
  // endpoint can't be used to find out who has signed up. The welcome email only goes out the
  // first time, and never blocks or fails the signup.
  async joinWaitlist(input: JoinWaitlistInput): Promise<void> {
    try {
      await WaitlistSignup.create({ email: input.email, name: input.name, interest: input.interest })
    } catch (error) {
      if (isDuplicateKeyError(error)) return
      throw error
    }

    void mailService
      .sendWaitlistWelcomeEmail({ name: input.name, email: input.email })
      .catch((error: unknown) => logger.error('Failed to send waitlist welcome email.', error))
  },

  // Hashing both sides gives equal-length buffers, so the comparison is constant-time.
  verifyAccessCode(code: string): void {
    if (!env.PRELAUNCH_ACCESS_CODE) {
      throw new AppError('Team access is not enabled.', 404)
    }

    if (!timingSafeEqual(sha256(code), sha256(env.PRELAUNCH_ACCESS_CODE))) {
      throw new AppError('That access code is not valid.', 401)
    }
  },
}
