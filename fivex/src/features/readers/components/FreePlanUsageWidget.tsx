import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { useFreePlanUsage } from '../hooks/useFreePlanUsage'

// Soft-upsell widget shown to signed-in readers on the free plan. Premium
// users never see this — see DashboardSidebar for the gating logic.
export function FreePlanUsageWidget() {
  const { usage, isLoading } = useFreePlanUsage()

  if (isLoading || !usage || usage.plan !== 'free') return null

  const resetDate = new Date(usage.resetDate).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className="mb-3 rounded-xl border border-border bg-surface-2 p-3">
      <p className="mb-2 text-xs font-semibold text-heading">Free plan usage</p>

      <ul className="space-y-1.5 text-xs text-text-muted">
        <li className="flex items-center justify-between">
          <span>Articles remaining</span>
          <span className="font-medium text-heading">
            {usage.articlesRemaining} / {usage.articlesLimit}
          </span>
        </li>

        <li className="flex items-center justify-between">
          <span>Video clip limit</span>
          <span className="font-medium text-heading">{usage.maxFreeVideoDurationSeconds}s</span>
        </li>

        <li className="flex items-center justify-between">
          <span>Searches remaining</span>
          <span className="font-medium text-heading">
            {usage.searchesRemaining} / {usage.searchesLimit}
          </span>
        </li>

        <li className="flex items-center justify-between">
          <span>Comments remaining</span>
          <span className="font-medium text-heading">
            {usage.commentsRemaining} / {usage.commentsLimit}
          </span>
        </li>

        <li className="flex items-center justify-between">
          <span>Resets</span>
          <span className="font-medium text-heading">{resetDate}</span>
        </li>
      </ul>

      <Link
        to="/subscribe"
        className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-accent-hover"
      >
        <Sparkles className="h-3.5 w-3.5" />
        Upgrade for unlimited access
      </Link>
    </div>
  )
}
