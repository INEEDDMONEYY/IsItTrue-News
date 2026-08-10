import { BadgeCheck, TriangleAlert } from 'lucide-react'
import type { FactCheckStatus } from '../types/authorArticle.types'

interface FactCheckIndicatorProps {
  status: FactCheckStatus | undefined
  issuesFound?: number
}

/**
 * Small badge shown next to an article once it's gone through the fact-check
 * system. Verified reads as an endorsement from the IsItTrue Fact-Check
 * Team; issues-found is a soft warning (it flags the claim, not the author)
 * that tells readers to take the article with a grain of salt.
 */
export function FactCheckIndicator({ status, issuesFound }: FactCheckIndicatorProps) {
  if (!status || status === 'not-submitted') return null

  if (status === 'pending' || status === 'in-review') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border bg-pending/10 text-pending border-pending/30">
        <BadgeCheck className="w-3.5 h-3.5" />
        {status === 'pending' ? 'Fact-check pending' : 'Fact-check in review'}
      </span>
    )
  }

  if (status === 'verified') {
    return (
      <span
        title="Verified by IsItTrue Fact-Check Team"
        className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border bg-verified/10 text-verified border-verified/30"
      >
        <BadgeCheck className="w-3.5 h-3.5" />
        Verified by IsItTrue Fact-Check Team
      </span>
    )
  }

  // issues-found
  return (
    <span
      title={issuesFound ? `${issuesFound} issue${issuesFound === 1 ? '' : 's'} found` : 'Fact-check issues found'}
      className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border bg-disputed/10 text-disputed border-disputed/30"
    >
      <TriangleAlert className="w-3.5 h-3.5" />
      Take with a grain of salt
    </span>
  )
}
