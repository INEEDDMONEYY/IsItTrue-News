import type { Request, Response } from 'express'
import { asyncHandler } from '../../../utils/asyncHandler.js'
import { clearAuthCookies, REFRESH_TOKEN_COOKIE, setAuthCookies } from '../../../utils/cookies.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { userRepository } from '../../users/repositories/user.repository.js'
import { auditActor, auditLogService } from '../../auditLogs/services/auditLog.service.js'
import { authService } from '../services/auth.service.js'
import { passwordResetService } from '../services/passwordReset.service.js'
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResendVerificationInput,
  ResetPasswordInput,
  VerifyEmailInput,
} from '../validations/auth.validation.js'

export const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const input = req.body as RegisterInput
    const user = await authService.register(input)

    res.status(201).json({
      message: 'Account created. Please check your email to verify your address before signing in.',
      user,
    })
  }),

  resendVerification: asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body as ResendVerificationInput
    await authService.resendVerification(email)

    res.status(200).json({
      message: 'If an account with that email exists and is unverified, a new verification email has been sent.',
    })
  }),

  verifyEmail: asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.body as VerifyEmailInput
    const userId = await authService.verifyEmail(token)
    await auditLogService.record({ eventType: 'auth.email_verified', actor: { id: userId }, ipAddress: req.ip })

    res.status(200).json({ message: 'Email verified successfully. You can now sign in.' })
  }),

  forgotPassword: asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body as ForgotPasswordInput
    await passwordResetService.requestReset(email)

    // Identical for every address: never confirm or deny that an account exists.
    res.status(200).json({
      message: 'If an account with that email exists, we have sent a link to reset its password.',
    })
  }),

  resetPassword: asyncHandler(async (req: Request, res: Response) => {
    const { token, password } = req.body as ResetPasswordInput
    const userId = await passwordResetService.resetPassword(token, password)
    await auditLogService.record({ eventType: 'auth.password_reset', actor: { id: userId }, ipAddress: req.ip })

    res.status(200).json({ message: 'Your password has been updated. You can now sign in.' })
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const input = req.body as LoginInput
    let session
    try {
      session = await authService.login(input)
    } catch (error) {
      if (error instanceof AppError) {
        const account = await userRepository.findByEmail(input.email)
        await auditLogService.record({
          eventType: 'auth.login_failed',
          outcome: 'failure',
          actor: { id: account ? String(account._id) : undefined, email: input.email },
          metadata: { reason: error.statusCode === 403 ? 'email_unverified' : 'invalid_credentials' },
          ipAddress: req.ip,
        })
      }
      throw error
    }

    const { user, accessToken, refreshToken } = session
    await auditLogService.record({
      eventType: 'auth.login',
      actor: { id: String(user._id), email: user.email, role: user.role },
      ipAddress: req.ip,
    })

    setAuthCookies(res, { accessToken, refreshToken })
    res.status(200).json({ message: 'Signed in successfully.', user })
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    await auditLogService.record({ eventType: 'auth.logout', actor: auditActor(req.user), ipAddress: req.ip })
    clearAuthCookies(res)
    res.status(200).json({ message: 'Signed out successfully.' })
  }),

  refresh: asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE] as string | undefined
    if (!refreshToken) {
      clearAuthCookies(res)
      throw new AppError('Your session has expired. Please sign in again.', 401)
    }

    try {
      const tokens = await authService.refreshSession(refreshToken)
      setAuthCookies(res, tokens)
      res.status(200).json({ message: 'Session renewed.' })
    } catch (error) {
      clearAuthCookies(res)
      throw error
    }
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError('You must be signed in to access this resource.', 401)
    }

    const user = await userRepository.findById(req.user.id)
    if (!user) {
      throw new AppError('Account not found.', 404)
    }

    res.status(200).json({ user })
  }),
}
