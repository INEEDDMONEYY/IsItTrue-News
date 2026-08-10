import { Router } from 'express'
import { authController } from '../controllers/auth.controller.js'
import { authenticate } from '../../../middleware/authenticate.js'
import { authRateLimiter, emailRateLimiter } from '../../../middleware/rateLimiter.js'
import { validate } from '../../../middleware/validate.js'
import { loginSchema, registerSchema, resendVerificationSchema, verifyEmailSchema } from '../validations/auth.validation.js'

const router = Router()

router.post('/register', emailRateLimiter, validate(registerSchema), authController.register)
router.post(
  '/resend-verification',
  emailRateLimiter,
  validate(resendVerificationSchema),
  authController.resendVerification,
)
router.post('/verify-email', authRateLimiter, validate(verifyEmailSchema), authController.verifyEmail)
router.post('/login', authRateLimiter, validate(loginSchema), authController.login)
router.post('/logout', authController.logout)
router.get('/me', authenticate, authController.me)

export const authRoutes = router

