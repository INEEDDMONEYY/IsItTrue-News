import { AdvertisementSectionLayout } from '../components/AdvertisementSectionLayout'
import { useState } from 'react'
import { AdvertisementBackendGap } from '../components/AdvertisementBackendGap'
import { AdvertisementQueryState, AdvertisementPill } from '../components/AdvertisementPrimitives'
import { useCampaigns } from '../hooks/useAdvertisement'
import { requireAdvertisementSection } from '../utils/advertisementSections'
import type { CampaignRow, CampaignPlacement, CampaignStatus } from '../types/advertisement.types'
import {
  PLACEMENT_LABELS,
  STATUS_LABELS as CAMPAIGN_STATUS_LABELS,
  formatCount,
  formatCtr,
  formatDate,
  formatMoney,
} from '@/features/advertiser/utils/format'

const section = requireAdvertisementSection('campaigns')

const PLACEMENT_OPTIONS = Object.keys(PLACEMENT_LABELS) as CampaignPlacement[]
const STATUS_OPTIONS = Object.keys(CAMPAIGN_STATUS_LABELS) as CampaignStatus[]

/** Shared campaign table; the Scheduling and Approvals pages reuse it with their own columns. */
export function CampaignTable({ campaigns }: { campaigns: CampaignRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b text-xs uppercase text-muted-foreground">
          <tr>
            <th className="py-2 pr-4">Campaign</th>
            <th className="py-2 pr-4">Advertiser</th>
            <th className="py-2 pr-4">Placement</th>
            <th className="py-2 pr-4">Status</th>
            <th className="py-2 pr-4">Dates</th>
            <th className="py-2 pr-4">Budget</th>
            <th className="py-2 pr-4">Impressions</th>
            <th className="py-2 pr-4">Clicks</th>
            <th className="py-2 pr-4">CTR</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((campaign) => (
            <tr key={campaign.id} className="border-b">
              <td className="py-2 pr-4 font-medium">{campaign.name}</td>
              <td className="py-2 pr-4">{campaign.advertiser?.businessName ?? '—'}</td>
              <td className="py-2 pr-4">{PLACEMENT_LABELS[campaign.placement]}</td>
              <td className="py-2 pr-4">
                <AdvertisementPill>{CAMPAIGN_STATUS_LABELS[campaign.status]}</AdvertisementPill>
              </td>
              <td className="py-2 pr-4">
                {formatDate(campaign.startDate)} – {formatDate(campaign.endDate)}
              </td>
              <td className="py-2 pr-4">{formatMoney(campaign.budgetCents)}</td>
              <td className="py-2 pr-4">{formatCount(campaign.impressions)}</td>
              <td className="py-2 pr-4">{formatCount(campaign.clicks)}</td>
              <td className="py-2 pr-4">{formatCtr(campaign.ctr)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function AdvertisementCampaignsPage() {
  const [status, setStatus] = useState<CampaignStatus | ''>('')
  const [placement, setPlacement] = useState<CampaignPlacement | ''>('')
  const { data, isLoading, error } = useCampaigns({
    status: status || undefined,
    placement: placement || undefined,
  })

  return (
    <AdvertisementSectionLayout section={section}>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label htmlFor="campaign-status" className="text-muted-foreground">
          Status
        </label>
        <select
          id="campaign-status"
          className="rounded-md border bg-background px-2 py-1"
          value={status}
          onChange={(event) => setStatus(event.target.value as CampaignStatus | '')}
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {CAMPAIGN_STATUS_LABELS[option]}
            </option>
          ))}
        </select>
        <label htmlFor="campaign-placement" className="text-muted-foreground">
          Placement
        </label>
        <select
          id="campaign-placement"
          className="rounded-md border bg-background px-2 py-1"
          value={placement}
          onChange={(event) => setPlacement(event.target.value as CampaignPlacement | '')}
        >
          <option value="">All placements</option>
          {PLACEMENT_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {PLACEMENT_LABELS[option]}
            </option>
          ))}
        </select>
      </div>

      <AdvertisementQueryState
        isLoading={isLoading}
        error={error}
        isEmpty={data?.length === 0}
        emptyMessage="No campaigns match these filters."
      >
        {data ? <CampaignTable campaigns={data} /> : null}
      </AdvertisementQueryState>
      <AdvertisementBackendGap section={section} />
    </AdvertisementSectionLayout>
  )
}
