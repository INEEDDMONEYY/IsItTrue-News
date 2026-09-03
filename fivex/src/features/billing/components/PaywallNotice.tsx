import { Link } from 'react-router-dom'
import { Lock, Sparkles } from 'lucide-react'

import { PREMIUM_FEATURES, type PremiumFeatureKey } from '../constants/premiumFeatures'

const GENERIC_PERKS = [
  'Unlock every author workspace tool',
  'Priority editorial support',
  'Advanced analytics on your published work',
]

interface PaywallNoticeProps {
  feature: PremiumFeatureKey
}

/**
 * Universal "you need to subscribe" page rendered in place of any gated
 * author feature. Shared across every locked page so the upsell is consistent.
 */
export function PaywallNotice({ feature }: PaywallNoticeProps) {
  const meta = PREMIUM_FEATURES[feature]
  const Icon = meta.icon

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] p-10 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-accent-bg)] text-[var(--color-accent)]">
          <Icon className="h-7 w-7" />
        </div>

        <p className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-[var(--color-accent-bg)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-accent)]">
          <Lock className="h-3.5 w-3.5" />
          Premium feature
        </p>

        <h1 className="mt-4 text-2xl font-bold tracking-tight text-[var(--color-card-heading)] sm:text-3xl">
          {meta.label} is part of Author Premium
        </h1>

        <p className="mt-3 text-sm leading-6 text-[var(--color-card-text-muted)]">
          {meta.description}
        </p>

        <ul className="mt-8 grid gap-3 text-left">
          {GENERIC_PERKS.map((perk) => (
            <li
              key={perk}
              className="flex items-start gap-2.5 text-sm text-[var(--color-card-text)]"
            >
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-accent)]" />
              {perk}
            </li>
          ))}
        </ul>

        <Link
          to="/subscribe"
          className="mt-8 inline-flex items-center justify-center rounded-xl bg-[var(--color-accent)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-hover)]"
        >
          View plans & subscribe
        </Link>
      </div>
    </main>
  )
}
