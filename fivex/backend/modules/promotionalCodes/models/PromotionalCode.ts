import { Schema, model, type HydratedDocument } from 'mongoose'

export const PROMO_CODE_METHODS = ['alphabetical', 'numeric', 'alphanumeric'] as const
export const PROMO_REWARD_TYPES = ['free-subscription', 'discount', 'trial-extension', 'other'] as const
export const PROMO_DURATION_UNITS = ['days', 'weeks', 'months'] as const
export const PROMO_ELIGIBLE_USERS = ['new', 'existing', 'both'] as const
export const PROMO_STATUSES = ['draft', 'active', 'paused', 'expired'] as const

export type PromoCodeMethod = (typeof PROMO_CODE_METHODS)[number]
export type PromoRewardType = (typeof PROMO_REWARD_TYPES)[number]
export type PromoDurationUnit = (typeof PROMO_DURATION_UNITS)[number]
export type PromoEligibleUsers = (typeof PROMO_ELIGIBLE_USERS)[number]
export type PromoStatus = (typeof PROMO_STATUSES)[number]

export interface IPromotionalCode {
  code: string
  method: PromoCodeMethod
  promotionName: string
  description: string
  rewardType: PromoRewardType
  subscriptionPlan: string
  rewardDurationValue: number
  rewardDurationUnit: PromoDurationUnit
  // Calendar dates as YYYY-MM-DD, compared as plain strings so a code expires on the same day for everyone.
  startDate: string
  expirationDate: string
  totalRedemptionLimit: number
  perUserLimit: number
  eligibleUsers: PromoEligibleUsers
  campaign: string
  partner: string
  status: PromoStatus
  createdAt: Date
  updatedAt: Date
}

export type PromotionalCodeDocument = HydratedDocument<IPromotionalCode>

const promotionalCodeSchema = new Schema<IPromotionalCode>(
  {
    code: { type: String, required: true, unique: true, trim: true, uppercase: true, minlength: 4, maxlength: 32 },
    method: { type: String, enum: PROMO_CODE_METHODS, required: true },
    promotionName: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 500, default: '' },
    rewardType: { type: String, enum: PROMO_REWARD_TYPES, required: true },
    subscriptionPlan: { type: String, required: true, trim: true, maxlength: 80 },
    rewardDurationValue: { type: Number, required: true, min: 1, max: 365 },
    rewardDurationUnit: { type: String, enum: PROMO_DURATION_UNITS, required: true },
    startDate: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    expirationDate: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    totalRedemptionLimit: { type: Number, required: true, min: 1, max: 1_000_000 },
    perUserLimit: { type: Number, required: true, min: 1, max: 1_000_000 },
    eligibleUsers: { type: String, enum: PROMO_ELIGIBLE_USERS, required: true },
    campaign: { type: String, trim: true, maxlength: 120, default: '' },
    partner: { type: String, trim: true, maxlength: 120, default: '' },
    status: { type: String, enum: PROMO_STATUSES, default: 'draft' },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = String(ret._id)
        delete ret._id
        delete ret.__v
        return ret
      },
    },
  },
)

export const PromotionalCode = model<IPromotionalCode>('PromotionalCode', promotionalCodeSchema)
