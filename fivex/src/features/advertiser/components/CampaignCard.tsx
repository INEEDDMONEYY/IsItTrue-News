import type { AdvertiserCampaign } from '../types/advertiser.types'
import { PLACEMENT_LABELS, campaignRef, formatCount, formatDate, formatMoney } from '../utils/format'
import { hasNoDelivery } from '../utils/statusStyles'
import { CampaignActions } from './CampaignActions'
import { CampaignStatusBadge } from './CampaignStatusBadge'

export function CampaignCard({
  campaign,
  onError,
}: {
  campaign: AdvertiserCampaign
  onError: (message: string | null) => void
}) {
  const noDelivery = hasNoDelivery(campaign.status)
  const metrics = [
    { label: 'Budget', value: formatMoney(campaign.budgetCents) },
    { label: 'Impressions', value: noDelivery ? '—' : formatCount(campaign.impressions) },
    { label: 'Clicks', value: noDelivery ? '—' : formatCount(campaign.clicks) },
  ]

  return (
    <article className="min-w-0 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex min-w-0 items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-medium text-text-muted">{campaignRef(campaign.id)}</p>
          <h3 className="mt-1 break-words text-sm font-semibold text-heading">{campaign.name}</h3>
          <p className="mt-1 text-xs text-text-muted">{PLACEMENT_LABELS[campaign.placement]}</p>
        </div>
        <CampaignStatusBadge status={campaign.status} size="sm" />
      </div>

      {campaign.status === 'rejected' && campaign.reviewNote && (
        <p className="mt-2 text-xs text-red-600">{campaign.reviewNote}</p>
      )}

      <p className="mt-3 text-xs text-text-muted">
        {campaign.startDate ? `${formatDate(campaign.startDate)} – ${formatDate(campaign.endDate)}` : 'Not scheduled'}
      </p>

      <dl className="mt-3 grid grid-cols-3 gap-3 border-t border-border pt-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="min-w-0">
            <dt className="text-[11px] text-text-muted">{metric.label}</dt>
            <dd className="mt-1 break-words text-sm font-semibold text-heading">{metric.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-3 border-t border-border pt-3">
        <CampaignActions campaign={campaign} onError={onError} />
      </div>
    </article>
  )
}
