import { Router } from 'express'
import { authenticateAdvertiser } from '../../../middleware/authenticateAdvertiser.js'
import { authRateLimiter, emailRateLimiter } from '../../../middleware/rateLimiter.js'
import { validate } from '../../../middleware/validate.js'
import {
  forgotPasswordSchema,
  loginSchema,
  resendVerificationSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from '../../auth/validations/auth.validation.js'
import { advertiserController } from '../controllers/advertiser.controller.js'
import { registerAdvertiserSchema } from '../validations/advertiser.validation.js'

// Advertiser accounts, sign-in and data. Entirely separate from /api/auth: its own accounts, its own session
// cookie and its own signing key, so nothing here accepts a reader/author/editor/admin session or the reverse.
const router = Router()

router.post('/auth/register', emailRateLimiter, validate(registerAdvertiserSchema), advertiserController.register)
router.post(
  '/auth/resend-verification',
  emailRateLimiter,
  validate(resendVerificationSchema),
  advertiserController.resendVerification,
)
router.post('/auth/verify-email', authRateLimiter, validate(verifyEmailSchema), advertiserController.verifyEmail)
router.post('/auth/login', authRateLimiter, validate(loginSchema), advertiserController.login)
router.post('/auth/logout', advertiserController.logout)
router.get('/auth/me', authenticateAdvertiser, advertiserController.me)

// Both limiters on purpose: per IP, and per IP + email, so neither one address nor one inbox can be flooded.
router.post(
  '/auth/forgot-password',
  authRateLimiter,
  emailRateLimiter,
  validate(forgotPasswordSchema),
  advertiserController.forgotPassword,
)
router.post('/auth/reset-password', authRateLimiter, validate(resetPasswordSchema), advertiserController.resetPassword)

router.get('/overview', authenticateAdvertiser, advertiserController.overview)

export const advertiserRoutes = router
