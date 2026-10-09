import type { PremiumFeatureKey } from './premiumFeatures'

// Billing isn't live yet, so every paywalled feature is unlocked for all signed-in users.
// Set a flag to false to enforce that gate again (premium plans still bypass it).
// Keep the reader-side limits in sync with backend/shared/constants/features.ts.
export const PREMIUM_FEATURE_FLAGS: Record<PremiumFeatureKey, boolean> = {
  drafts: true,
  pitchCenter: true,
  collaboration: true,
  evidenceVault: true,
  investigations: true,
  analytics: true,
}
