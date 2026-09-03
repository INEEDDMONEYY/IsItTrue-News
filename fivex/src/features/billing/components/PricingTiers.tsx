import { useState } from 'react'
import { Crown, Gift, PenLine, Sparkles } from 'lucide-react'

import { useAuth } from '@/app/providers/AuthProvider'

import { AUTHOR_PRICING_TIERS, EDITOR_PRICING_TIERS, READER_PRICING_TIERS } from '../constants/pricingTiers'
import { isPremiumUser } from '../utils/plan'
import { PricingTierCard } from './PricingTierCard'
import { PlanFlipCard } from './PlanFlipCard'

export function PricingTiers() {
  const { user, isAuthenticated } = useAuth()
  const [message, setMessage] = useState<string | null>(null)
  const premium = isPremiumUser(user)
  const isReader = user?.role === 'reader'
  const isAuthor = user?.role === 'author'

  const handleSubscribe = (tierId: string) => {
    if (tierId === 'author-premium' || tierId === 'reader-premium') {
      setMessage('Payments are coming soon — Stripe checkout will be wired up shortly.')
    }
  }

  const [freeTier, readerPremiumTier] = READER_PRICING_TIERS
  const [authorFreeTier, authorPremiumTier] = AUTHOR_PRICING_TIERS

  return (
    <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
      <div className="grid gap-10 md:grid-cols-3">
        <div>
          <h2 className="mb-6 text-center text-xl font-bold tracking-tight text-[var(--color-heading)]">
            For readers
          </h2>
          <PlanFlipCard
            freeTier={freeTier}
            premiumTier={readerPremiumTier}
            isFreeCurrent={isAuthenticated && isReader && !premium}
            isPremiumCurrent={isAuthenticated && isReader && premium}
            isAuthenticated={isAuthenticated}
            onSubscribe={handleSubscribe}
            freeIcon={Gift}
            premiumIcon={Sparkles}
          />
        </div>

        <div>
          <h2 className="mb-6 text-center text-xl font-bold tracking-tight text-[var(--color-heading)]">
            For authors
          </h2>
          <PlanFlipCard
            freeTier={authorFreeTier}
            premiumTier={authorPremiumTier}
            isFreeCurrent={isAuthenticated && isAuthor && !premium}
            isPremiumCurrent={isAuthenticated && isAuthor && premium}
            isAuthenticated={isAuthenticated}
            onSubscribe={handleSubscribe}
            freeIcon={PenLine}
            premiumIcon={Crown}
          />
        </div>

        <div>
          <h2 className="mb-6 text-center text-xl font-bold tracking-tight text-[var(--color-heading)]">
            For editors
          </h2>
          {EDITOR_PRICING_TIERS.map((tier) => (
            <PricingTierCard
              key={tier.id}
              tier={tier}
              isCurrentPlan={false}
              isAuthenticated={isAuthenticated}
              onSubscribe={() => handleSubscribe(tier.id)}
            />
          ))}
        </div>
      </div>

      {message && (
        <p className="mt-6 text-center text-sm text-[var(--color-text-muted)]">{message}</p>
      )}

      <p className="mt-3 text-center text-xs text-[var(--color-text-dim)]">
        Editor Premium is on the roadmap — pricing and perks for editorial
        teams will be announced separately.
      </p>
    </section>
  )
}
