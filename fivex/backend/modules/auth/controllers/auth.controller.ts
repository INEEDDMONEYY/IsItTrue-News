import type { Request, Response } from 'express'
import { asyncHandler } from '../../../utils/asyncHandler.js'
import { clearAuthCookies, setAuthCookies } from '../../../utils/cookies.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { userRepository } from '../../users/repositories/user.repository.js'
import { authService } from '../services/auth.service.js'
import type { LoginInput, RegisterInput, ResendVerificationInput, VerifyEmailInput } from '../validations/auth.validation.js'

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
    await authService.verifyEmail(token)

    res.status(200).json({ message: 'Email verified successfully. You can now sign in.' })
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const input = req.body as LoginInput
    const { user, accessToken, refreshToken } = await authService.login(input)

    setAuthCookies(res, { accessToken, refreshToken })
    res.status(200).json({ message: 'Signed in successfully.', user })
  }),

  logout: asyncHandler(async (_req: Request, res: Response) => {
    clearAuthCookies(res)
    res.status(200).json({ message: 'Signed out successfully.' })
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
