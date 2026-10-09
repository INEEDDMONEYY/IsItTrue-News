import { Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import type { PricingTier } from '../constants/pricingTiers'

interface PricingTierCardProps {
  tier: PricingTier
  isCurrentPlan: boolean
  isAuthenticated: boolean
  onSubscribe: () => void
  className?: string
}

export function PricingTierCard({
  tier,
  isCurrentPlan,
  isAuthenticated,
  onSubscribe,
  className = '',
}: PricingTierCardProps) {
  const navigate = useNavigate()
  const disabled = tier.comingSoon || isCurrentPlan

  // Anonymous visitors haven't picked a plan yet, so every card nudges them
  // to sign up first; signed-in readers/authors are managing an existing plan.
  const ctaLabel = isCurrentPlan
    ? 'Current plan'
    : !isAuthenticated
      ? 'Create an account'
      : 'Upgrade to premium'

  const handleClick = () => {
    if (!isAuthenticated) {
      navigate('/register')
      return
    }
    onSubscribe()
  }

  return (
    <div
      className={`flex flex-col rounded-2xl border p-6 shadow-sm ${
        tier.highlighted
          ? 'border-[var(--color-accent)] bg-[var(--color-accent-bg)] ring-1 ring-[var(--color-accent-border)]'
          : 'border-[var(--color-card-border)] bg-[var(--color-card)]'
      } ${className}`}
    >
      {tier.highlighted && (
        <span className="mb-3 inline-flex w-fit items-center rounded-full bg-brand-gradient px-3 py-1 text-xs font-semibold text-on-brand">
          Most popular
        </span>
      )}

      <h3 className="text-lg font-bold text-[var(--color-card-heading)]">{tier.name}</h3>

      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-3xl font-bold text-[var(--color-card-heading)]">
          {tier.price}
        </span>

        {tier.cadence && (
          <span className="text-sm text-[var(--color-card-text-muted)]">{tier.cadence}</span>
        )}
      </div>

      <p className="mt-3 text-sm leading-6 text-[var(--color-card-text-muted)]">
        {tier.description}
      </p>

      <ul className="mt-6 min-h-0 flex-1 space-y-2.5 overflow-y-auto pr-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tier.perks.map((perk) => (
          <li
            key={perk}
            className="flex items-start gap-2.5 text-sm text-[var(--color-card-text)]"
          >
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-accent)]" />
            {perk}
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className={`mt-8 w-full rounded-xl px-4 py-3 text-sm font-semibold transition ${
          disabled
            ? 'cursor-not-allowed bg-[var(--color-card-2)] text-[var(--color-card-text-dim)]'
            : 'bg-brand-gradient text-on-brand'
        }`}
      >
        {ctaLabel}
      </button>
    </div>
  )
}
