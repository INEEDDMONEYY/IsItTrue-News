import dayjs from '@/lib/dayjs'
import type { FactCheck } from '@/shared/types/factCheck.types'
import { VerdictBadge } from './VerdictBadge'

export function FactCheckCard({ factCheck }: { factCheck: FactCheck }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-card-border bg-card p-5 hover:border-accent-border transition-colors">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="text-[11px] uppercase tracking-wide font-medium text-accent">
          {factCheck.category.name}
        </span>
        <VerdictBadge verdict={factCheck.verdict} />
      </div>

      <p className="text-sm font-semibold text-card-heading leading-snug">
        &ldquo;{factCheck.claim}&rdquo;
      </p>

      <p className="text-xs text-card-text-muted leading-relaxed line-clamp-3">
        {factCheck.summary}
      </p>

      <div className="flex items-center justify-between gap-2 text-xs text-card-text-dim pt-3 border-t border-card-border mt-1">
        <span>Checked by {factCheck.checkedBy}</span>
        <span>{dayjs(factCheck.checkedAt).format('MMM D, YYYY')}</span>
      </div>
    </div>
  )
}
