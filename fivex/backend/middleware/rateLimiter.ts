import rateLimit from 'express-rate-limit'
import { env } from '../config/env.js'

/**
 * General limiter for auth endpoints (login attempts, etc.) — keyed by IP.
 */
export const authRateLimiter = rateLimit({
  windowMs: env.AUTH_RATE_LIMIT_WINDOW_MINUTES * 60 * 1000,
  max: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please try again later.' },
})

/**
 * Stricter limiter for any endpoint that triggers an outbound email
 * (signup, resend verification). Keyed by IP *and* the target email address so a
 * single attacker can't spam either one target inbox or many inboxes from one IP.
 */
export const emailRateLimiter = rateLimit({
  windowMs: env.EMAIL_RATE_LIMIT_WINDOW_MINUTES * 60 * 1000,
  max: env.EMAIL_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : 'unknown'
    return `${req.ip ?? 'unknown'}:${email}`
  },
  message: { message: 'Too many email requests. Please try again later.' },
})

/**
 * Per-IP limiter for the public pre-launch endpoints (waitlist signup, team access code),
 * so one address can neither flood the waitlist with different emails nor brute-force the code.
 */
export const prelaunchRateLimiter = rateLimit({
  windowMs: env.PRELAUNCH_RATE_LIMIT_WINDOW_MINUTES * 60 * 1000,
  max: env.PRELAUNCH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please try again later.' },
})

/**
 * Same window for team access attempts, but only failed guesses count, so a correct code
 * never locks a developer out while repeated wrong guesses do.
 */
export const accessCodeRateLimiter = rateLimit({
  windowMs: env.PRELAUNCH_RATE_LIMIT_WINDOW_MINUTES * 60 * 1000,
  max: env.PRELAUNCH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { message: 'Too many attempts. Please try again later.' },
})
