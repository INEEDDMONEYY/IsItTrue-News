import { z } from 'zod'
import {
  PROMO_CODE_METHODS,
  PROMO_DURATION_UNITS,
  PROMO_ELIGIBLE_USERS,
  PROMO_REWARD_TYPES,
  PROMO_STATUSES,
  type PromoCodeMethod,
} from '../models/PromotionalCode.js'

const CODE_PATTERNS: Record<PromoCodeMethod, RegExp> = {
  alphabetical: /^[A-Z]+$/,
  numeric: /^[0-9]+$/,
  alphanumeric: /^[A-Z0-9]+$/,
}

const MAX_REDEMPTIONS = 1_000_000
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

const dateString = z.string().trim().regex(DATE_PATTERN, 'Use a YYYY-MM-DD date')
const wholeNumber = (min: number, max: number, label: string) =>
  z.coerce.number({ invalid_type_error: `${label} must be a number` }).int(`${label} must be a whole number`).min(min, `${label} must be at least ${min}`).max(max, `${label} must be at most ${max}`)

const promotionalCodeFields = z.object({
  code: z.string().trim().transform((value) => value.toUpperCase()).pipe(z.string().min(4, 'Code must be 4–32 characters').max(32, 'Code must be 4–32 characters')),
  method: z.enum(PROMO_CODE_METHODS),
  promotionName: z.string().trim().min(1, 'Promotion name is required').max(120),
  description: z.string().trim().max(500).default(''),
  rewardType: z.enum(PROMO_REWARD_TYPES),
  subscriptionPlan: z.string().trim().min(1, 'Subscription plan is required').max(80),
  rewardDurationValue: wholeNumber(1, 365, 'Reward duration'),
  rewardDurationUnit: z.enum(PROMO_DURATION_UNITS),
  startDate: dateString,
  expirationDate: dateString,
  totalRedemptionLimit: wholeNumber(1, MAX_REDEMPTIONS, 'Total redemption limit'),
  perUserLimit: wholeNumber(1, MAX_REDEMPTIONS, 'Per-user limit'),
  eligibleUsers: z.enum(PROMO_ELIGIBLE_USERS),
  campaign: z.string().trim().max(120).default(''),
  partner: z.string().trim().max(120).default(''),
  status: z.enum(PROMO_STATUSES).default('draft'),
})

export const promotionalCodeInputSchema = promotionalCodeFields.superRefine((input, ctx) => {
  if (!CODE_PATTERNS[input.method].test(input.code)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['code'], message: `Code does not match the ${input.method} method` })
  }
  if (input.expirationDate < input.startDate) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['expirationDate'], message: 'Expiration must be on or after the start date' })
  }
  if (input.perUserLimit > input.totalRedemptionLimit) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['perUserLimit'], message: 'Per-user limit cannot exceed the total redemption limit' })
  }
})

export type PromotionalCodeInput = z.infer<typeof promotionalCodeInputSchema>
