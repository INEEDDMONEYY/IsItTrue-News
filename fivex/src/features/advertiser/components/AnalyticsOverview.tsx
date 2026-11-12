import type { AdvertiserAnalytics } from '../types/advertiser.types'
import { formatCount, formatCtr } from '../utils/format'
import { PLACEMENT_SPEC_BY_ID } from '../utils/placements'

// Impressions per placement as horizontal bars, scaled to the busiest placement.
export function AnalyticsOverview({ byPlacement }: { byPlacement: AdvertiserAnalytics['byPlacement'] }) {
  const max = Math.max(1, ...byPlacement.map((row) => row.impressions))

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <h2 className="text-base font-semibold text-heading">By placement</h2>
      <p className="mt-1 text-xs text-text-muted">Impressions, clicks and click-through rate for each ad option.</p>

      <ul className="mt-5 space-y-4">
        {byPlacement.map((row) => (
          <li key={row.placement}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <p className="text-sm font-medium text-heading">
                {PLACEMENT_SPEC_BY_ID[row.placement].label}
                <span className="ml-2 text-xs font-normal text-text-muted">
                  {row.campaigns} campaign{row.campaigns === 1 ? '' : 's'}
                </span>
              </p>
              <p className="text-xs text-text-muted">
                {formatCount(row.impressions)} impressions · {formatCount(row.clicks)} clicks · {formatCtr(row.ctr)} CTR
              </p>
            </div>
            <div
              className="mt-2 h-2 overflow-hidden rounded-full bg-surface"
              role="img"
              aria-label={`${formatCount(row.impressions)} impressions`}
            >
              <div className="h-full rounded-full bg-accent" style={{ width: `${(row.impressions / max) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
