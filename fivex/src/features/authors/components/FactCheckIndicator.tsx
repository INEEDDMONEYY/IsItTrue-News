import { useState } from 'react'
import { BadgeCheck, TriangleAlert } from 'lucide-react'
import type { ArticleFactCheckStatus } from '../types/authorArticle.types'

interface FactCheckIndicatorProps {
  status: ArticleFactCheckStatus | undefined
  rejectionReason?: string
}

/**
 * Small badge shown next to an article once it's gone through the fact-check
 * system. Approved reads as an endorsement from the IsItTrue Fact-Check
 * Team; rejected is a soft warning (it flags the claim, not the author) that
 * tells readers to take the article with a grain of salt, with the admin's
 * reason available on hover/tap.
 */
export function FactCheckIndicator({ status, rejectionReason }: FactCheckIndicatorProps) {
  const [showReason, setShowReason] = useState(false)

  if (!status || status === 'none') return null

  if (status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border bg-pending/10 text-pending border-pending/30">
        <BadgeCheck className="w-3.5 h-3.5" />
        Fact-check pending
      </span>
    )
  }

  if (status === 'approved') {
    return (
      <span
        title="Approved by IsItTrue Fact-Check Team"
        className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border bg-verified/10 text-verified border-verified/30"
      >
        <BadgeCheck className="w-3.5 h-3.5" />
        Approved by IsItTrue Fact-Check Team
      </span>
    )
  }

  // rejected
  return (
    <span className="relative inline-block">
      <button
        type="button"
        onClick={() => setShowReason((v) => !v)}
        title={rejectionReason ? `Rejected: ${rejectionReason}` : 'Fact-check rejected'}
        className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border bg-disputed/10 text-disputed border-disputed/30 hover:bg-disputed/20 transition-colors"
      >
        <TriangleAlert className="w-3.5 h-3.5" />
        Take with a grain of salt
      </button>
      {showReason && rejectionReason && (
        <span className="absolute left-0 top-[calc(100%+6px)] z-10 w-64 rounded-lg border border-card-border bg-card p-3 text-xs text-card-text shadow-lg">
          <span className="block font-medium text-card-heading mb-1">Fact-check rejected</span>
          {rejectionReason}
        </span>
      )}
    </span>
  )
}
