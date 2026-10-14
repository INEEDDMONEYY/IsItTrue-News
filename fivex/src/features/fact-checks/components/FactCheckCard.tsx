import { Link } from 'react-router-dom'
import dayjs from '@/lib/dayjs'
import type { PublicFactCheckSummary } from '../types/publicFactCheck.types'
import { VerdictBadge } from './VerdictBadge'

export function FactCheckCard({ factCheck }: { factCheck: PublicFactCheckSummary }) {
  return (
    <Link
      to={`/fact-checks/${factCheck.id}`}
      className="flex flex-col gap-3 rounded-2xl border border-card-border bg-card p-5 hover:border-accent-border transition-colors"
    >
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="text-[11px] uppercase tracking-wide font-medium text-accent">{factCheck.article.category}</span>
        <VerdictBadge verdict={factCheck.verdict} />
      </div>

      <p className="text-sm font-semibold text-card-heading leading-snug break-words">&ldquo;{factCheck.claim}&rdquo;</p>

      {factCheck.summary && (
        <p className="text-xs text-card-text-muted leading-relaxed line-clamp-3 break-words">{factCheck.summary}</p>
      )}

      <p className="text-xs text-card-text-dim line-clamp-1">From: {factCheck.article.title}</p>

      <div className="flex items-center justify-between gap-2 text-xs text-card-text-dim pt-3 border-t border-card-border mt-auto">
        <span>{factCheck.checkedBy ? `Checked by ${factCheck.checkedBy}` : 'Checked by our team'}</span>
        <span className="flex items-center gap-2">
          {factCheck.sourceCount > 0 && (
            <span>
              {factCheck.sourceCount} {factCheck.sourceCount === 1 ? 'source' : 'sources'}
            </span>
          )}
          {factCheck.checkedAt && <time dateTime={factCheck.checkedAt}>{dayjs(factCheck.checkedAt).format('MMM D, YYYY')}</time>}
        </span>
      </div>
    </Link>
  )
}
