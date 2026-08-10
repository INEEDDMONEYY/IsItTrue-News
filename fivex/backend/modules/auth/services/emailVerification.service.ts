import { env } from '../../../config/env.js'
import { logger } from '../../../config/logger.js'
import { mailService } from '../../../mail/mail.service.js'
import { generateVerificationToken } from '../../../utils/tokens.js'
import { userRepository } from '../../users/repositories/user.repository.js'

function verificationExpiryDate(): Date {
  return new Date(Date.now() + env.EMAIL_VERIFICATION_EXPIRES_IN_MINUTES * 60 * 1000)
}

/**
 * Issues a fresh email-verification token for a user and emails it to them.
 * Shared by registration (auth module) and email-address changes (users module)
 * so both flows use the exact same verification mechanics.
 */
export async function issueAndSendVerificationEmail(user: {
  _id: unknown
  name: string
  email: string
}): Promise<void> {
  const { token, tokenHash } = generateVerificationToken()
  await userRepository.setVerificationToken(String(user._id), tokenHash, verificationExpiryDate())

  try {
    await mailService.sendVerificationEmail({ name: user.name, email: user.email, token })
  } catch (error) {
    // Don't fail the request just because the mail provider hiccuped — log it so
    // it's visible in ops, the user can still request a resend.
    logger.error(`Failed to send verification email to ${user.email}`, error)
  }
}
