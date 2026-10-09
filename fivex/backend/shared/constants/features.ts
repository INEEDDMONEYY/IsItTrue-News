// Billing isn't live yet, so every paywalled feature is unlocked for all signed-in users.
// Set a flag to false to enforce that gate again (premium plans still bypass it).
export const PREMIUM_FEATURE_FLAGS = {
  unlimitedArticles: true,
  unlimitedSearch: true,
  unlimitedComments: true,
  fullLengthVideos: true,
  fullInvestigations: true,
} as const

export type PremiumFeature = keyof typeof PREMIUM_FEATURE_FLAGS

export function hasPremiumAccess(feature: PremiumFeature, plan?: string): boolean {
  return PREMIUM_FEATURE_FLAGS[feature] || plan === 'premium'
}

export const FREE_PLAN_LIMITS_ENFORCED = Object.values(PREMIUM_FEATURE_FLAGS).some((unlocked) => !unlocked)
