import { assertDeliverableEmail } from '../../../security/emailValidator.js'
import { signAccessToken, signRefreshToken } from '../../../security/tokens.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { comparePassword, hashPassword } from '../../../utils/password.js'
import { hashToken } from '../../../utils/tokens.js'
import { userRepository } from '../../users/repositories/user.repository.js'
import { issueAndSendVerificationEmail } from './emailVerification.service.js'
import type { LoginInput, RegisterInput } from '../validations/auth.validation.js'

const MIN_RESEND_INTERVAL_MS = 60 * 1000

export const authService = {
  async register(input: RegisterInput) {
    await assertDeliverableEmail(input.email)

    const existing = await userRepository.findByEmail(input.email)
    if (existing) {
      throw new AppError('An account with this email already exists.', 409)
    }

    const passwordHash = await hashPassword(input.password)
    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
    })

    await issueAndSendVerificationEmail(user)

    return user
  },

  async resendVerification(email: string): Promise<void> {
    await assertDeliverableEmail(email)

    const user = await userRepository.findByEmailWithSecrets(email)
    // Don't reveal whether the account exists or is already verified — respond the
    // same way either way and only actually send when there's something to do.
    if (!user || user.isEmailVerified) {
      return
    }

    if (
      user.emailVerificationLastSentAt &&
      Date.now() - user.emailVerificationLastSentAt.getTime() < MIN_RESEND_INTERVAL_MS
    ) {
      throw new AppError('Please wait a moment before requesting another email.', 429)
    }

    await issueAndSendVerificationEmail(user)
  },

  async verifyEmail(token: string): Promise<void> {
    const tokenHash = hashToken(token)
    const user = await userRepository.findByVerificationTokenHash(tokenHash)

    if (!user || !user.emailVerificationExpires || user.emailVerificationExpires.getTime() < Date.now()) {
      throw new AppError('This verification link is invalid or has expired.', 400)
    }

    await userRepository.markEmailVerified(String(user._id))
  },

  async login(input: LoginInput) {
    const user = await userRepository.findByEmailWithSecrets(input.email)

    // Same generic message whether the email doesn't exist or the password is
    // wrong — don't help an attacker enumerate registered accounts.
    const invalidCredentials = () => new AppError('Invalid email or password.', 401)

    if (!user) {
      throw invalidCredentials()
    }

    const passwordMatches = await comparePassword(input.password, user.passwordHash)
    if (!passwordMatches) {
      throw invalidCredentials()
    }

    if (!user.isEmailVerified) {
      throw new AppError('Please verify your email address before signing in.', 403)
    }

    const accessToken = signAccessToken({ sub: String(user._id), email: user.email, role: user.role })
    const refreshToken = signRefreshToken({ sub: String(user._id) })

    return { user, accessToken, refreshToken }
  },
}
