export type CodeMethod = 'alphabetical' | 'numeric' | 'alphanumeric'
export type RewardType = 'free-subscription' | 'discount' | 'trial-extension' | 'other'
export type DurationUnit = 'days' | 'weeks' | 'months'
export type EligibleUsers = 'new' | 'existing' | 'both'
export type PromotionStatus = 'draft' | 'active' | 'paused' | 'expired'

export interface PromotionalCode {
  id: string
  code: string
  method: CodeMethod
  promotionName: string
  description: string
  rewardType: RewardType
  subscriptionPlan: string
  rewardDurationValue: number
  rewardDurationUnit: DurationUnit
  startDate: string
  expirationDate: string
  totalRedemptionLimit: number
  perUserLimit: number
  eligibleUsers: EligibleUsers
  campaign: string
  partner: string
  status: PromotionStatus
}

export type PromotionalCodeRecord = Omit<PromotionalCode, 'id'>

// Numeric fields stay as text while editing so partial input is not rejected mid-typing.
export interface PromotionalCodeDraft {
  code: string
  method: CodeMethod
  promotionName: string
  description: string
  rewardType: RewardType
  subscriptionPlan: string
  rewardDurationValue: string
  rewardDurationUnit: DurationUnit
  startDate: string
  expirationDate: string
  totalRedemptionLimit: string
  perUserLimit: string
  eligibleUsers: EligibleUsers
  campaign: string
  partner: string
  status: PromotionStatus
}

export type PromotionalCodeErrors = Partial<Record<keyof PromotionalCodeDraft, string>>

export const METHOD_LABELS: Record<CodeMethod, string> = {
  alphabetical: 'Alphabetical (e.g. NEWS, TRUTH)',
  numeric: 'Numeric (e.g. 202611)',
  alphanumeric: 'Alphanumeric (e.g. IIT2026)',
}

export const REWARD_TYPE_LABELS: Record<RewardType, string> = {
  'free-subscription': 'Free subscription',
  discount: 'Discount',
  'trial-extension': 'Trial extension',
  other: 'Other',
}

export const ELIGIBLE_USER_LABELS: Record<EligibleUsers, string> = {
  new: 'New users',
  existing: 'Existing users',
  both: 'New and existing users',
}

export const STATUS_LABELS: Record<PromotionStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  paused: 'Paused',
  expired: 'Expired',
}

const CHARSETS: Record<CodeMethod, string> = {
  alphabetical: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numeric: '0123456789',
  // Omits look-alike characters (0/O, 1/I) so codes are easy to read aloud and type.
  alphanumeric: 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789',
}

const CODE_PATTERNS: Record<CodeMethod, RegExp> = {
  alphabetical: /^[A-Z]+$/,
  numeric: /^[0-9]+$/,
  alphanumeric: /^[A-Z0-9]+$/,
}

const MIN_CODE_LENGTH = 4
const MAX_CODE_LENGTH = 32
const MAX_REDEMPTIONS = 1_000_000
const MAX_DURATION_VALUE = 365

export function emptyDraft(): PromotionalCodeDraft {
  return {
    code: '',
    method: 'alphanumeric',
    promotionName: '',
    description: '',
    rewardType: 'free-subscription',
    subscriptionPlan: 'Premium',
    rewardDurationValue: '1',
    rewardDurationUnit: 'months',
    startDate: '',
    expirationDate: '',
    totalRedemptionLimit: '',
    perUserLimit: '1',
    eligibleUsers: 'both',
    campaign: '',
    partner: '',
    status: 'draft',
  }
}

export function draftFromCode(code: PromotionalCode): PromotionalCodeDraft {
  return {
    code: code.code,
    method: code.method,
    promotionName: code.promotionName,
    description: code.description,
    rewardType: code.rewardType,
    subscriptionPlan: code.subscriptionPlan,
    rewardDurationValue: String(code.rewardDurationValue),
    rewardDurationUnit: code.rewardDurationUnit,
    startDate: code.startDate,
    expirationDate: code.expirationDate,
    totalRedemptionLimit: String(code.totalRedemptionLimit),
    perUserLimit: String(code.perUserLimit),
    eligibleUsers: code.eligibleUsers,
    campaign: code.campaign,
    partner: code.partner,
    status: code.status,
  }
}

function randomIndex(max: number): number {
  // Rejection sampling keeps every character equally likely.
  const limit = 256 - (256 % max)
  const buffer = new Uint8Array(1)
  for (;;) {
    crypto.getRandomValues(buffer)
    if (buffer[0] < limit) return buffer[0] % max
  }
}

/** Builds a code of `length` characters for the method, optionally starting with a fixed prefix. */
export function generateCode(method: CodeMethod, length: number, prefix = ''): string {
  const charset = CHARSETS[method]
  const cleanPrefix = prefix.toUpperCase().replace(/[^A-Z0-9]/g, '')
  const randomLength = Math.max(0, length - cleanPrefix.length)
  const random = Array.from({ length: randomLength }, () => charset[randomIndex(charset.length)]).join('')
  return `${cleanPrefix}${random}`
}

export function getEffectiveStatus(code: PromotionalCodeRecord, today: string): PromotionStatus {
  // An active code past its expiration date stops working, so it displays as expired.
  if (code.status === 'active' && code.expirationDate < today) return 'expired'
  return code.status
}

export function formatReward(
  code: Pick<PromotionalCodeRecord, 'rewardType' | 'rewardDurationValue' | 'rewardDurationUnit' | 'subscriptionPlan'>,
): string {
  const unit = code.rewardDurationValue === 1 ? code.rewardDurationUnit.replace(/s$/, '') : code.rewardDurationUnit
  return `${REWARD_TYPE_LABELS[code.rewardType]}: ${code.rewardDurationValue} ${unit} of ${code.subscriptionPlan}`
}

function isWholeNumberInRange(value: string, min: number, max: number): boolean {
  const number = Number(value)
  return value.trim() !== '' && Number.isInteger(number) && number >= min && number <= max
}

/**
 * Validates a draft. Returns field errors, plus the normalized record when valid.
 * `existingCodes` is used to reject duplicates, ignoring the record being edited.
 */
export function validatePromotionalCode(
  draft: PromotionalCodeDraft,
  existingCodes: readonly PromotionalCode[],
  editingId: string | null,
): { errors: PromotionalCodeErrors; value: PromotionalCodeRecord | null } {
  const errors: PromotionalCodeErrors = {}
  const code = draft.code.trim().toUpperCase()

  if (!code) {
    errors.code = 'Code is required.'
  } else if (code.length < MIN_CODE_LENGTH || code.length > MAX_CODE_LENGTH) {
    errors.code = `Code must be ${MIN_CODE_LENGTH}–${MAX_CODE_LENGTH} characters.`
  } else if (!CODE_PATTERNS[draft.method].test(code)) {
    errors.code = `Code does not match the ${draft.method} method.`
  } else if (existingCodes.some((item) => item.id !== editingId && item.code === code)) {
    errors.code = 'This code already exists.'
  }

  if (!draft.promotionName.trim()) errors.promotionName = 'Promotion name is required.'
  if (!draft.subscriptionPlan.trim()) errors.subscriptionPlan = 'Subscription plan is required.'
  if (!isWholeNumberInRange(draft.rewardDurationValue, 1, MAX_DURATION_VALUE)) {
    errors.rewardDurationValue = `Enter a whole number from 1 to ${MAX_DURATION_VALUE}.`
  }
  if (!draft.startDate) errors.startDate = 'Start date is required.'
  if (!draft.expirationDate) {
    errors.expirationDate = 'Expiration date is required.'
  } else if (draft.startDate && draft.expirationDate < draft.startDate) {
    errors.expirationDate = 'Expiration must be on or after the start date.'
  }
  if (!isWholeNumberInRange(draft.totalRedemptionLimit, 1, MAX_REDEMPTIONS)) {
    errors.totalRedemptionLimit = `Enter a whole number from 1 to ${MAX_REDEMPTIONS.toLocaleString()}.`
  }
  if (!isWholeNumberInRange(draft.perUserLimit, 1, MAX_REDEMPTIONS)) {
    errors.perUserLimit = 'Enter a whole number of at least 1.'
  } else if (
    isWholeNumberInRange(draft.totalRedemptionLimit, 1, MAX_REDEMPTIONS) &&
    Number(draft.perUserLimit) > Number(draft.totalRedemptionLimit)
  ) {
    errors.perUserLimit = 'Per-user limit cannot exceed the total redemption limit.'
  }

  if (Object.keys(errors).length > 0) return { errors, value: null }

  return {
    errors,
    value: {
      code,
      method: draft.method,
      promotionName: draft.promotionName.trim(),
      description: draft.description.trim(),
      rewardType: draft.rewardType,
      subscriptionPlan: draft.subscriptionPlan.trim(),
      rewardDurationValue: Number(draft.rewardDurationValue),
      rewardDurationUnit: draft.rewardDurationUnit,
      startDate: draft.startDate,
      expirationDate: draft.expirationDate,
      totalRedemptionLimit: Number(draft.totalRedemptionLimit),
      perUserLimit: Number(draft.perUserLimit),
      eligibleUsers: draft.eligibleUsers,
      campaign: draft.campaign.trim(),
      partner: draft.partner.trim(),
      status: draft.status,
    },
  }
}
