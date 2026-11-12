import { env } from '../../../config/env.js'
import { logger } from '../../../config/logger.js'
import { mailService } from '../../../mail/mail.service.js'
import { assertDeliverableEmail } from '../../../security/emailValidator.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { comparePassword, hashPassword } from '../../../utils/password.js'
import { generateVerificationToken, hashToken } from '../../../utils/tokens.js'
import { ADVERTISER_STATUSES } from '../constants/advertiser.js'
import type { AdvertiserDocument } from '../models/Advertiser.js'
import { advertiserRepository } from '../repositories/advertiser.repository.js'
import type { RegisterAdvertiserInput } from '../validations/advertiser.validation.js'

const MIN_RESEND_INTERVAL_MS = 60 * 1000
const INVALID_VERIFICATION_LINK = 'This verification link is invalid or has expired.'
const INVALID_RESET_LINK = 'This reset link is invalid or has expired. Please request a new one.'

// Compared against when the email isn't registered, so "no such account" takes as long to reject as "wrong
// password" and response time can't be used to find out who has an account.
let dummyHash: Promise<string> | undefined
function getDummyHash(): Promise<string> {
  dummyHash ??= hashPassword('not-a-real-password')
  return dummyHash
}

async function issueAndSendVerificationEmail(advertiser: AdvertiserDocument): Promise<void> {
  const { token, tokenHash } = generateVerificationToken()
  const expires = new Date(Date.now() + env.EMAIL_VERIFICATION_EXPIRES_IN_MINUTES * 60 * 1000)
  await advertiserRepository.setVerificationToken(String(advertiser._id), tokenHash, expires)

  try {
    await mailService.sendAdvertiserVerificationEmail({
      businessName: advertiser.businessName,
      email: advertiser.email,
      token,
    })
  } catch (error) {
    // A mail-provider hiccup shouldn't fail the request: the advertiser can ask for another email.
    logger.error(`Failed to send advertiser verification email to ${advertiser.email}`, error)
  }
}

function assertResendAllowed(advertiser: AdvertiserDocument): void {
  if (
    advertiser.emailVerificationLastSentAt &&
    Date.now() - advertiser.emailVerificationLastSentAt.getTime() < MIN_RESEND_INTERVAL_MS
  ) {
    throw new AppError('Please wait a moment before requesting another email.', 429)
  }
}

export const advertiserAuthService = {
  async register(input: RegisterAdvertiserInput): Promise<AdvertiserDocument> {
    await assertDeliverableEmail(input.email)

    const existing = await advertiserRepository.findByEmailWithRegistrationState(input.email)
    if (existing) {
      // An unverified account whose link expired or was lost gets a fresh link, but only for someone who
      // knows its password, so this never reveals or hands out a link to a stranger.
      const knowsPassword =
        !existing.isEmailVerified && (await comparePassword(input.password, existing.passwordHash))
      if (!knowsPassword) {
        throw new AppError(
          'An advertiser account with this email already exists. Sign in instead, or reset your password if you have forgotten it.',
          409,
        )
      }

      assertResendAllowed(existing)
      await issueAndSendVerificationEmail(existing)
      return existing
    }

    const passwordHash = await hashPassword(input.password)
    const advertiser = await advertiserRepository.create({
      businessName: input.businessName,
      email: input.email,
      passwordHash,
    })

    await issueAndSendVerificationEmail(advertiser)
    return advertiser
  },

  // Responds the same whether or not the account exists or is already verified.
  async resendVerification(email: string): Promise<void> {
    await assertDeliverableEmail(email)

    const advertiser = await advertiserRepository.findByEmailWithVerificationState(email)
    if (!advertiser || advertiser.isEmailVerified) return

    assertResendAllowed(advertiser)
    await issueAndSendVerificationEmail(advertiser)
  },

  async verifyEmail(token: string): Promise<void> {
    const advertiser = await advertiserRepository.findByVerificationTokenHash(hashToken(token))

    if (!advertiser?.emailVerificationExpires || advertiser.emailVerificationExpires.getTime() < Date.now()) {
      throw new AppError(INVALID_VERIFICATION_LINK, 400)
    }

    await advertiserRepository.markEmailVerified(String(advertiser._id))
  },

  async login(email: string, password: string): Promise<AdvertiserDocument> {
    const advertiser = await advertiserRepository.findByEmailWithSecrets(email)

    // One message whether the email is unknown or the password is wrong.
    const invalidCredentials = () => new AppError('Invalid email or password.', 401)

    if (!advertiser) {
      await comparePassword(password, await getDummyHash())
      throw invalidCredentials()
    }

    if (!(await comparePassword(password, advertiser.passwordHash))) {
      throw invalidCredentials()
    }

    // Only someone who knows the password is told about the account's state.
    if (advertiser.status === ADVERTISER_STATUSES.SUSPENDED) {
      throw new AppError('This advertiser account has been suspended.', 403)
    }
    if (!advertiser.isEmailVerified) {
      throw new AppError('Please verify your email address before signing in.', 403)
    }

    await advertiserRepository.recordLogin(String(advertiser._id))
    return advertiser
  },

  // Resolves the same way whether or not the address belongs to an account. Sending is deliberately not awaited,
  // so the response time doesn't give it away either.
  async requestPasswordReset(email: string): Promise<void> {
    const advertiser = await advertiserRepository.findByEmailWithResetState(email)
    if (!advertiser) return

    if (advertiser.passwordResetLastSentAt && Date.now() - advertiser.passwordResetLastSentAt.getTime() < MIN_RESEND_INTERVAL_MS) {
      return
    }

    const { token, tokenHash } = generateVerificationToken()
    const expires = new Date(Date.now() + env.PASSWORD_RESET_EXPIRES_IN_MINUTES * 60 * 1000)
    await advertiserRepository.setPasswordResetToken(String(advertiser._id), tokenHash, expires)

    void mailService
      .sendAdvertiserPasswordResetEmail({ businessName: advertiser.businessName, email: advertiser.email, token })
      .catch((error: unknown) => logger.error(`Failed to send advertiser password reset email to ${advertiser.email}`, error))
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const tokenHash = hashToken(token)

    // Cheap lookup first, so a bad link never pays for a password hash.
    const pending = await advertiserRepository.findByPasswordResetTokenHash(tokenHash)
    if (!pending?.passwordResetExpires || pending.passwordResetExpires.getTime() < Date.now()) {
      throw new AppError(INVALID_RESET_LINK, 400)
    }

    const advertiser = await advertiserRepository.consumePasswordResetToken(tokenHash, await hashPassword(newPassword))
    if (!advertiser) {
      throw new AppError(INVALID_RESET_LINK, 400)
    }

    void mailService
      .sendAdvertiserPasswordChangedEmail({ businessName: advertiser.businessName, email: advertiser.email })
      .catch((error: unknown) => logger.error(`Failed to send advertiser password-changed notice to ${advertiser.email}`, error))
  },
}
