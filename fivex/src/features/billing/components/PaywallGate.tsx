import type { ReactNode } from 'react'

import { useAuth } from '@/app/providers/AuthProvider'

import type { PremiumFeatureKey } from '../constants/premiumFeatures'
import { hasPremiumAccess } from '../utils/plan'
import { PaywallNotice } from './PaywallNotice'

interface PaywallGateProps {
  feature: PremiumFeatureKey
  children: ReactNode
}

/**
 * Renders children only for premium users; free users see the universal
 * paywall notice for the given feature instead.
 */
export function PaywallGate({ feature, children }: PaywallGateProps) {
  const { user } = useAuth()

  if (hasPremiumAccess(user, feature)) return <>{children}</>

  return <PaywallNotice feature={feature} />
}
