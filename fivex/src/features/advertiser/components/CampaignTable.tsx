import type { AdvertiserCampaign } from '../types/advertiser.types'
import { PLACEMENT_LABELS, campaignRef, formatCount, formatDate, formatMoney } from '../utils/format'
import { hasNoDelivery } from '../utils/statusStyles'
import { CampaignActions } from './CampaignActions'
import { CampaignStatusBadge } from './CampaignStatusBadge'

const th = 'px-4 py-3 text-xs font-semibold text-text-muted'

export function CampaignTable({
  campaigns,
  onError,
}: {
  campaigns: AdvertiserCampaign[]
  onError: (message: string | null) => void
}) {
  return (
    <div className="hidden overflow-x-auto rounded-2xl border border-border bg-card shadow-sm md:block">
      <table className="w-full min-w-[860px] text-left">
        <thead className="border-b border-border bg-surface">
          <tr>
            <th className={`${th} pl-5`}>Campaign</th>
            <th className={th}>Status</th>
            <th className={th}>Schedule</th>
            <th className={th}>Budget</th>
            <th className={th}>Impressions</th>
            <th className={th}>Clicks</th>
            <th className={th}>
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {campaigns.map((campaign) => {
            const noDelivery = hasNoDelivery(campaign.status)
            return (
              <tr key={campaign.id} className="align-top transition-colors hover:bg-surface/60">
                <td className="py-4 pl-5 pr-4">
                  <p className="text-sm font-semibold text-heading">{campaign.name}</p>
                  <p className="mt-1 text-xs text-text-muted">
                    {PLACEMENT_LABELS[campaign.placement]} · {campaignRef(campaign.id)}
                  </p>
                  {campaign.status === 'rejected' && campaign.reviewNote && (
                    <p className="mt-1 max-w-xs text-xs text-red-600">{campaign.reviewNote}</p>
                  )}
                </td>
                <td className="px-4 py-4">
                  <CampaignStatusBadge status={campaign.status} />
                </td>
                <td className="px-4 py-4 text-xs text-text">
                  {campaign.startDate ? (
                    <>
                      {formatDate(campaign.startDate)}
                      <br />
                      <span className="text-text-muted">to {formatDate(campaign.endDate)}</span>
                    </>
                  ) : (
                    <span className="text-text-muted">Not scheduled</span>
                  )}
                </td>
                <td className="px-4 py-4 text-sm font-medium text-heading">{formatMoney(campaign.budgetCents)}</td>
                <td className="px-4 py-4 text-sm text-heading">{noDelivery ? '—' : formatCount(campaign.impressions)}</td>
                <td className="px-4 py-4 text-sm text-heading">{noDelivery ? '—' : formatCount(campaign.clicks)}</td>
                <td className="px-4 py-4">
                  <CampaignActions campaign={campaign} onError={onError} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
