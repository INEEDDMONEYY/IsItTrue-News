import { Router } from 'express'
import { authController } from '../controllers/auth.controller.js'
import { authenticate } from '../../../middleware/authenticate.js'
import { authRateLimiter, emailRateLimiter } from '../../../middleware/rateLimiter.js'
import { validate } from '../../../middleware/validate.js'
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resendVerificationSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from '../validations/auth.validation.js'

const router = Router()

router.post('/register', emailRateLimiter, validate(registerSchema), authController.register)
router.post(
  '/resend-verification',
  emailRateLimiter,
  validate(resendVerificationSchema),
  authController.resendVerification,
)
router.post('/verify-email', authRateLimiter, validate(verifyEmailSchema), authController.verifyEmail)

// Both limiters on purpose: per IP (so one address can't spray links at many inboxes) and per IP + email
// (so one inbox can't be flooded). Limit responses carry no information about whether the account exists.
router.post(
  '/forgot-password',
  authRateLimiter,
  emailRateLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword,
)
router.post('/reset-password', authRateLimiter, validate(resetPasswordSchema), authController.resetPassword)
router.post('/login', authRateLimiter, validate(loginSchema), authController.login)
router.post('/logout', authController.logout)
router.get('/me', authenticate, authController.me)

export const authRoutes = router

