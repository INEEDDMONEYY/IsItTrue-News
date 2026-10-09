import { z } from 'zod'
import { WAITLIST_INTERESTS } from '../constants/waitlistInterest.js'

export const joinWaitlistSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address').max(254, 'Email is too long'),
  name: z
    .string()
    .trim()
    .max(80, 'Name is too long')
    .optional()
    .transform((name) => name || undefined),
  interest: z.enum(WAITLIST_INTERESTS).optional(),
})

export type JoinWaitlistInput = z.infer<typeof joinWaitlistSchema>

export const accessCodeSchema = z.object({
  // Bounded so an oversized body can't be used to burn CPU on hashing.
  code: z.string().min(1, 'Enter the access code').max(200, 'Access code is too long'),
})

export type AccessCodeInput = z.infer<typeof accessCodeSchema>
