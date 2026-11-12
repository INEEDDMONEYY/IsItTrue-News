import { z } from 'zod'
import { passwordSchema } from '../../auth/validations/auth.validation.js'

export const registerAdvertiserSchema = z.object({
  businessName: z.string().trim().min(2, 'Business name must be at least 2 characters').max(120, 'Business name is too long'),
  email: z.string().trim().toLowerCase().email('Please provide a valid email address').max(254),
  // Same strength rules as every other account on the platform.
  password: passwordSchema,
})

export type RegisterAdvertiserInput = z.infer<typeof registerAdvertiserSchema>
