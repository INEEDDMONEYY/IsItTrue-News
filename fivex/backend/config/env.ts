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

  CLIENT_ORIGINS: z
    .string()
    .min(1, 'CLIENT_ORIGINS must list at least one allowed origin')
    .transform((value) => value.split(',').map((origin) => origin.trim()).filter(Boolean)),

  MONGO_URI: z.string().url('MONGO_URI must be a valid MongoDB connection string'),

  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

  EMAIL_VERIFICATION_EXPIRES_IN_MINUTES: z.coerce.number().int().positive().default(60),
  APP_URL: z.string().url('APP_URL must be a valid URL'),

  UNSEND_API_KEY: z.string().optional().default(''),
  UNSEND_BASE_URL: z.string().url().optional().default('https://app.unsend.dev'),
  MAIL_FROM: z.string().default('IsItTrue News <no-reply@isittrue.com>'),

  CLOUDINARY_CLOUD_NAME: z.string().min(1, 'CLOUDINARY_CLOUD_NAME is required'),
  CLOUDINARY_API_KEY: z.string().min(1, 'CLOUDINARY_API_KEY is required'),
  CLOUDINARY_API_SECRET: z.string().min(1, 'CLOUDINARY_API_SECRET is required'),

  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(20),
  AUTH_RATE_LIMIT_WINDOW_MINUTES: z.coerce.number().int().positive().default(15),
  EMAIL_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(3),
  EMAIL_RATE_LIMIT_WINDOW_MINUTES: z.coerce.number().int().positive().default(60),
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
