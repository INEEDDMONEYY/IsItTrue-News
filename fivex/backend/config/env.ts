import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

/**
 * Validates and parses required environment variables at startup.
 * The process fails fast with a clear message if anything required is missing,
 * instead of surfacing confusing errors later (e.g. a silent DB/mail failure).
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),

  // Comma-separated frontend origins allowed to call the API, each as scheme + host (+ port), e.g.
  // https://www.isittruenews.com. A browser's Origin never has a path or trailing slash, so those are stripped.
  CLIENT_ORIGINS: z
    .string()
    .min(1, 'CLIENT_ORIGINS must list at least one allowed origin')
    .transform((value) =>
      value
        .split(',')
        .map((origin) => origin.trim().replace(/\/+$/, ''))
        .filter(Boolean),
    ),

  MONGO_URI: z.string().url('MONGO_URI must be a valid MongoDB connection string'),

  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

  EMAIL_VERIFICATION_EXPIRES_IN_MINUTES: z.coerce.number().int().positive().default(60),
  // How long a "reset your password" link stays valid. Short on purpose: it grants access to the account.
  PASSWORD_RESET_EXPIRES_IN_MINUTES: z.coerce.number().int().positive().max(1440).default(30),
  APP_URL: z.string().url('APP_URL must be a valid URL'),

  // Unosend (https://unosend.co) transactional email. Leave the key blank in development to log
  // emails to the console instead of sending them.
  UNOSEND_API_KEY: z.string().optional().default(''),
  UNOSEND_BASE_URL: z.string().url().optional().default('https://api.unosend.co'),
  // Must be an address on a domain verified in your Unosend account.
  MAIL_FROM: z.string().default('IsItTrue News <no-reply@isittruenews.com>'),
  // Optional: where replies go (e.g. a monitored inbox). Unlike MAIL_FROM, this can be any address,
  // including Gmail. Leave blank to send with no Reply-To.
  MAIL_REPLY_TO: z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    z.string().trim().email('MAIL_REPLY_TO must be a plain email address, e.g. support@example.com').optional(),
  ),

  CLOUDINARY_CLOUD_NAME: z.string().min(1, 'CLOUDINARY_CLOUD_NAME is required'),
  CLOUDINARY_API_KEY: z.string().min(1, 'CLOUDINARY_API_KEY is required'),
  CLOUDINARY_API_SECRET: z.string().min(1, 'CLOUDINARY_API_SECRET is required'),
  // Backup storage for uploads when Cloudinary is unreachable (relative to the process cwd).
  UPLOAD_DIR: z.string().min(1).default('uploads'),

  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(20),
  AUTH_RATE_LIMIT_WINDOW_MINUTES: z.coerce.number().int().positive().default(15),
  EMAIL_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(3),
  EMAIL_RATE_LIMIT_WINDOW_MINUTES: z.coerce.number().int().positive().default(60),

  // Pre-launch team access: the code developers enter at /dev-access to bypass the landing page.
  // Leave blank to disable the bypass endpoint entirely.
  PRELAUNCH_ACCESS_CODE: z
    .string()
    .default('')
    .refine((code) => code === '' || code.length >= 12, 'PRELAUNCH_ACCESS_CODE must be at least 12 characters'),
  PRELAUNCH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),
  PRELAUNCH_RATE_LIMIT_WINDOW_MINUTES: z.coerce.number().int().positive().default(15),

  // How many reverse proxies sit between the internet and this server (Render's load balancer is 1;
  // Vercel rewriting /api to Render makes it 2). Express uses this to work out the real client IP,
  // which the rate limiters key on. Too low: every visitor shares one limit. Too high: clients can
  // forge their IP. Leave unset for the default (1 in production, 0 otherwise).
  TRUST_PROXY_HOPS: z.preprocess(
    // A blank line in .env must mean "unset", not 0 (z.coerce would turn '' into 0).
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    z.coerce
      .number({ invalid_type_error: 'TRUST_PROXY_HOPS must be a whole number (e.g. 1)' })
      .int('TRUST_PROXY_HOPS must be a whole number (e.g. 1)')
      .min(0, 'TRUST_PROXY_HOPS cannot be negative')
      .max(5, 'TRUST_PROXY_HOPS above 5 is almost certainly a mistake')
      .optional(),
  ),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  const issues = parsed.error.issues.map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`).join('\n')
  throw new Error(
    `Invalid or missing environment variables. Copy .env.example to .env and fill in the values:\n${issues}`,
  )
}

export const env = parsed.data
export const isProduction = env.NODE_ENV === 'production'
// Production runs behind Render's load balancer (one hop); local development has no proxy.
export const trustProxyHops = env.TRUST_PROXY_HOPS ?? (isProduction ? 1 : 0)
