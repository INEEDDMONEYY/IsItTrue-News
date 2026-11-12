import { Eye, Info, Megaphone, MousePointerClick, Percent } from 'lucide-react'
import { LoaderState } from '@/components/loaders/LoaderState'
import { PageLoader } from '@/components/loaders/PageLoader'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { AdvertiserPageHeader } from '../components/AdvertiserPageHeader'
import { AdvertiserStatCard } from '../components/AdvertiserStatCard'
import { AnalyticsOverview } from '../components/AnalyticsOverview'
import { CampaignStatusBadge } from '../components/CampaignStatusBadge'
import { useAdvertiserAnalytics } from '../hooks/useAdvertiserReports'
import { formatCount, formatCtr, formatDate } from '../utils/format'
import { PLACEMENT_SPEC_BY_ID } from '../utils/placements'

export function AnalyticsPage() {
  const analytics = useAdvertiserAnalytics()

  if (analytics.isLoading) return <PageLoader label="Loading analytics…" />
  if (analytics.isError || !analytics.data) {
    return (
      <LoaderState alert title="Couldn't load analytics" message={getErrorMessage(analytics.error)}>
        <button type="button" onClick={() => analytics.refetch()} className="text-sm font-semibold text-accent hover:underline">
          Try again
        </button>
      </LoaderState>
    )
  }

  const { totals, byPlacement, campaigns } = analytics.data
  const noDeliveryYet = totals.impressions === 0

  return (
    <div className="mx-auto w-full max-w-7xl">
      <AdvertiserPageHeader title="Analytics" description="How your submitted campaigns are performing across IsItTrue News." />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdvertiserStatCard label="Impressions" value={formatCount(totals.impressions)} description="Times your ads were shown" icon={Eye} />
        <AdvertiserStatCard label="Clicks" value={formatCount(totals.clicks)} description="Readers who clicked through" icon={MousePointerClick} />
        <AdvertiserStatCard label="Click-through rate" value={formatCtr(totals.ctr)} description="Clicks ÷ impressions" icon={Percent} />
        <AdvertiserStatCard
          label="Campaigns"
          value={formatCount(totals.campaigns)}
          description={`${formatCount(totals.activeCampaigns)} running now`}
          icon={Megaphone}
        />
      </div>

      {noDeliveryYet && (
        <p className="mb-6 flex items-start gap-2 rounded-2xl border border-accent-border bg-accent-bg px-4 py-3 text-sm text-heading">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
          No impressions have been recorded yet. Numbers appear here once your approved ads start being shown to readers.
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <AnalyticsOverview byPlacement={byPlacement} />

        <section className="min-w-0 rounded-2xl border border-border bg-card shadow-sm">
          <div className="p-4 sm:p-5">
            <h2 className="text-base font-semibold text-heading">By campaign</h2>
            <p className="mt-1 text-xs text-text-muted">Drafts are excluded until they are submitted.</p>
          </div>
          {campaigns.length === 0 ? (
            <p className="border-t border-border p-6 text-center text-sm text-text-muted">No submitted campaigns yet.</p>
          ) : (
            <div className="overflow-x-auto border-t border-border">
              <table className="w-full min-w-[640px] text-left">
                <thead className="bg-surface">
                  <tr className="text-xs font-semibold text-text-muted">
                    <th className="px-5 py-3">Campaign</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Impressions</th>
                    <th className="px-4 py-3 text-right">Clicks</th>
                    <th className="px-4 py-3 text-right">CTR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {campaigns.map((row) => (
                    <tr key={row.id}>
                      <td className="px-5 py-3">
                        <p className="text-sm font-semibold text-heading">{row.name}</p>
                        <p className="text-xs text-text-muted">
                          {PLACEMENT_SPEC_BY_ID[row.placement].label} · {formatDate(row.startDate)} – {formatDate(row.endDate)}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <CampaignStatusBadge status={row.status} size="sm" />
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-heading">{formatCount(row.impressions)}</td>
                      <td className="px-4 py-3 text-right text-sm text-heading">{formatCount(row.clicks)}</td>
                      <td className="px-4 py-3 text-right text-sm text-heading">{formatCtr(row.ctr)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
