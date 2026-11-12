import type { Request, Response } from 'express'
import { asyncHandler } from '../../../utils/asyncHandler.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { clearAdvertiserSessionCookie, setAdvertiserSessionCookie } from '../../../security/advertiserSession.js'
import type {
  ForgotPasswordInput,
  LoginInput,
  ResendVerificationInput,
  ResetPasswordInput,
  VerifyEmailInput,
} from '../../auth/validations/auth.validation.js'
import { advertiserRepository } from '../repositories/advertiser.repository.js'
import { advertiserAuthService } from '../services/advertiserAuth.service.js'
import { advertiserOverviewService } from '../services/advertiserOverview.service.js'
import type { RegisterAdvertiserInput } from '../validations/advertiser.validation.js'

function requireAdvertiser(req: Request) {
  if (!req.advertiser) {
    throw new AppError('You must be signed in to access this resource.', 401)
  }
  return req.advertiser
}

export const advertiserController = {
  // Creating an account does not sign anyone in: the email has to be confirmed first.
  register: asyncHandler(async (req: Request, res: Response) => {
    const advertiser = await advertiserAuthService.register(req.body as RegisterAdvertiserInput)
    res.status(201).json({
      message: 'Account created. Please check your email to verify your address before signing in.',
      advertiser,
    })
  }),

  resendVerification: asyncHandler(async (req: Request, res: Response) => {
    await advertiserAuthService.resendVerification((req.body as ResendVerificationInput).email)
    res.status(200).json({
      message: 'If an account with that email exists and is unverified, a new verification email has been sent.',
    })
  }),

  verifyEmail: asyncHandler(async (req: Request, res: Response) => {
    await advertiserAuthService.verifyEmail((req.body as VerifyEmailInput).token)
    res.status(200).json({ message: 'Email verified successfully. You can now sign in.' })
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body as LoginInput
    const advertiser = await advertiserAuthService.login(email, password)

    setAdvertiserSessionCookie(res, String(advertiser._id))
    res.status(200).json({ message: 'Signed in successfully.', advertiser })
  }),

  logout: asyncHandler(async (_req: Request, res: Response) => {
    clearAdvertiserSessionCookie(res)
    res.status(200).json({ message: 'Signed out successfully.' })
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    const advertiser = await advertiserRepository.findById(requireAdvertiser(req).id)
    if (!advertiser) {
      throw new AppError('Account not found.', 404)
    }
    res.status(200).json({ advertiser })
  }),

  forgotPassword: asyncHandler(async (req: Request, res: Response) => {
    await advertiserAuthService.requestPasswordReset((req.body as ForgotPasswordInput).email)
    // Identical for every address: never confirm or deny that an account exists.
    res.status(200).json({
      message: 'If an account with that email exists, we have sent a link to reset its password.',
    })
  }),

  resetPassword: asyncHandler(async (req: Request, res: Response) => {
    const { token, password } = req.body as ResetPasswordInput
    await advertiserAuthService.resetPassword(token, password)
    res.status(200).json({ message: 'Your password has been updated. You can now sign in.' })
  }),

  overview: asyncHandler(async (req: Request, res: Response) => {
    const overview = await advertiserOverviewService.getOverview(requireAdvertiser(req).id)
    res.status(200).json(overview)
  }),
}
