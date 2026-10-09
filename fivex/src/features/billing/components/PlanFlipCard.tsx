import { useState } from 'react'
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

import type { PricingTier } from '../constants/pricingTiers'
import { PricingTierCard } from './PricingTierCard'

interface PlanFlipCardProps {
  freeTier: PricingTier
  premiumTier: PricingTier
  isFreeCurrent: boolean
  isPremiumCurrent: boolean
  isAuthenticated: boolean
  onSubscribe: (tierId: string) => void
  freeIcon: LucideIcon
  premiumIcon: LucideIcon
}

// The premium tier sits behind the free card; the icon toggle flips the card
// in 3D (framer-motion rotateY) to reveal whichever face is selected.
export function PlanFlipCard({
  freeTier,
  premiumTier,
  isFreeCurrent,
  isPremiumCurrent,
  isAuthenticated,
  onSubscribe,
  freeIcon: FreeIcon,
  premiumIcon: PremiumIcon,
}: PlanFlipCardProps) {
  const [showPremium, setShowPremium] = useState(false)

  return (
    <div className="relative" style={{ perspective: 1500 }}>
      <div className="absolute right-4 top-4 z-10 flex gap-1.5">
        <button
          type="button"
          onClick={() => setShowPremium(false)}
          aria-pressed={!showPremium}
          aria-label={`Show ${freeTier.name} plan`}
          title={freeTier.name}
          className={`flex h-8 w-8 items-center justify-center rounded-full border transition ${
            !showPremium
              ? 'border-transparent bg-brand-gradient text-on-brand'
              : 'border-[var(--color-card-border)] bg-[var(--color-card)] text-[var(--color-card-text-dim)] hover:text-[var(--color-card-text)]'
          }`}
        >
          <FreeIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setShowPremium(true)}
          aria-pressed={showPremium}
          aria-label={`Show ${premiumTier.name} plan`}
          title={premiumTier.name}
          className={`flex h-8 w-8 items-center justify-center rounded-full border transition ${
            showPremium
              ? 'border-transparent bg-brand-gradient text-on-brand'
              : 'border-[var(--color-card-border)] bg-[var(--color-card)] text-[var(--color-card-text-dim)] hover:text-[var(--color-card-text)]'
          }`}
        >
          <PremiumIcon className="h-4 w-4" />
        </button>
      </div>

      <motion.div
        className="relative"
        style={{ transformStyle: 'preserve-3d', minHeight: 640 }}
        animate={{ rotateY: showPremium ? 180 : 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      >
        <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden' }}>
          <PricingTierCard
            tier={freeTier}
            isCurrentPlan={isFreeCurrent}
            isAuthenticated={isAuthenticated}
            onSubscribe={() => onSubscribe(freeTier.id)}
            className="h-full"
          />
        </div>

        <div
          className="absolute inset-0"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <PricingTierCard
            tier={premiumTier}
            isCurrentPlan={isPremiumCurrent}
            isAuthenticated={isAuthenticated}
            onSubscribe={() => onSubscribe(premiumTier.id)}
            className="h-full"
          />
        </div>
      </motion.div>
    </div>
  )
}
