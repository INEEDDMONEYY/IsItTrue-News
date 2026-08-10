import { z } from 'zod'

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(128, 'Password is too long')
  .regex(/[a-z]/, 'Password must include a lowercase letter')
  .regex(/[A-Z]/, 'Password must include an uppercase letter')
  .regex(/[0-9]/, 'Password must include a number')

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80, 'Name is too long'),
  email: z.string().trim().toLowerCase().email('Please provide a valid email address'),
  password: passwordSchema,
})

export type RegisterInput = z.infer<typeof registerSchema>

export const resendVerificationSchema = z.object({
  email: z.string().trim().toLowerCase().email('Please provide a valid email address'),
})

export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'A verification token is required'),
})

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Please provide a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export type LoginInput = z.infer<typeof loginSchema>

