import { Router } from 'express'
import { accessCodeRateLimiter, emailRateLimiter, prelaunchRateLimiter } from '../../../middleware/rateLimiter.js'
import { validate } from '../../../middleware/validate.js'
import { prelaunchController } from '../controllers/prelaunch.controller.js'
import { accessCodeSchema, joinWaitlistSchema } from '../validations/prelaunch.validation.js'

const router = Router()

// Public: join the early-access waitlist. Both limiters apply — per-IP, and per IP + email
// (the latter because each new signup triggers an outbound email).
router.post(
  '/waitlist',
  prelaunchRateLimiter,
  emailRateLimiter,
  validate(joinWaitlistSchema),
  prelaunchController.joinWaitlist,
)

// Public: lets the team bypass the landing page. The code is checked here, never in the browser.
router.post('/access', accessCodeRateLimiter, validate(accessCodeSchema), prelaunchController.verifyAccess)

export const prelaunchRoutes = router
