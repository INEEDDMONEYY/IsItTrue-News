import type { AuthUser } from '@/features/auth/types/auth.types'
import { PREMIUM_FEATURE_FLAGS } from '../constants/premiumFeatureFlags'
import type { PremiumFeatureKey } from '../constants/premiumFeatures'

export function isPremiumUser(user: AuthUser | null | undefined): boolean {
  return user?.plan === 'premium'
}

// Use this (not isPremiumUser) to gate a feature, so the dev flags are respected.
export function hasPremiumAccess(user: AuthUser | null | undefined, feature: PremiumFeatureKey): boolean {
  return PREMIUM_FEATURE_FLAGS[feature] || isPremiumUser(user)
}
