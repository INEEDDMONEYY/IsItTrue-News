import { env } from '../../../config/env.js'
import { logger } from '../../../config/logger.js'
import { mailService } from '../../../mail/mail.service.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { hashPassword } from '../../../utils/password.js'
import { generateVerificationToken, hashToken } from '../../../utils/tokens.js'
import { userRepository } from '../../users/repositories/user.repository.js'

// A second request inside this window is ignored (quietly), so one inbox can't be flooded with links.
const MIN_RESET_INTERVAL_MS = 60 * 1000

const INVALID_LINK = 'This reset link is invalid or has expired. Please request a new one.'

function resetExpiryDate(): Date {
  return new Date(Date.now() + env.PASSWORD_RESET_EXPIRES_IN_MINUTES * 60 * 1000)
}

export const passwordResetService = {
  // Resolves the same way whether or not the address belongs to an account (and never says which), so this
  // endpoint can't be used to find out who is registered. Sending is deliberately not awaited, so the
  // response time doesn't give it away either.
  async requestReset(email: string): Promise<void> {
    const user = await userRepository.findByEmailWithResetState(email)
    if (!user) return

    if (user.passwordResetLastSentAt && Date.now() - user.passwordResetLastSentAt.getTime() < MIN_RESET_INTERVAL_MS) {
      return
    }

    const { token, tokenHash } = generateVerificationToken()
    await userRepository.setPasswordResetToken(String(user._id), tokenHash, resetExpiryDate())

    void mailService
      .sendPasswordResetEmail({ name: user.name, email: user.email, token })
      .catch((error: unknown) => logger.error(`Failed to send password reset email to ${user.email}`, error))
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const tokenHash = hashToken(token)

    // Cheap lookup first, so a bad link never pays for a password hash.
    const pending = await userRepository.findByPasswordResetTokenHash(tokenHash)
    if (!pending?.passwordResetExpires || pending.passwordResetExpires.getTime() < Date.now()) {
      throw new AppError(INVALID_LINK, 400)
    }

    const passwordHash = await hashPassword(newPassword)

    // Atomic: only one of two simultaneous submissions of the same link can succeed.
    const user = await userRepository.consumePasswordResetToken(tokenHash, passwordHash)
    if (!user) {
      throw new AppError(INVALID_LINK, 400)
    }

    void mailService
      .sendPasswordChangedEmail({ name: user.name, email: user.email })
      .catch((error: unknown) => logger.error(`Failed to send password-changed notice to ${user.email}`, error))
  },
}
