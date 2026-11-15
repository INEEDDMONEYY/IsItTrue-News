import { AdvertisementSectionLayout } from '../components/AdvertisementSectionLayout'
import { AdvertisementBackendGap } from '../components/AdvertisementBackendGap'
import { AdvertisementQueryState, AdvertisementStatCard, AdvertisementPill } from '../components/AdvertisementPrimitives'
import { useAdvertisementOverview } from '../hooks/useAdvertisement'
import { requireAdvertisementSection } from '../utils/advertisementSections'
import { STATUS_LABELS as CAMPAIGN_STATUS_LABELS, formatCount, formatCtr, formatMoney } from '@/features/advertiser/utils/format'

const section = requireAdvertisementSection('overview')

export function AdvertisementOverviewPage() {
  const { data, isLoading, error } = useAdvertisementOverview()

  return (
    <AdvertisementSectionLayout section={section}>
      <AdvertisementQueryState isLoading={isLoading} error={error}>
        {data ? (
          <div className="space-y-6">
            {!data.paymentsEnabled ? (
              <p className="rounded-md border p-3 text-sm text-muted-foreground">
                No payment provider is connected. Revenue below is committed campaign budget, not collected payments.
              </p>
            ) : null}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <AdvertisementStatCard label="Committed revenue" value={formatMoney(data.totals.committedCents)} />
              <AdvertisementStatCard label="Active campaigns" value={formatCount(data.totals.activeCampaigns)} />
              <AdvertisementStatCard label="Pending approvals" value={formatCount(data.totals.pendingApprovals)} />
              <AdvertisementStatCard
                label="Impressions"
                value={formatCount(data.totals.impressions)}
                note={`${formatCount(data.totals.clicks)} clicks · CTR ${formatCtr(data.totals.ctr)}`}
              />
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <section className="space-y-2">
                <h2 className="text-lg font-semibold text-foreground">Campaigns by status</h2>
                <ul className="flex flex-wrap gap-2">
                  {Object.entries(data.campaignsByStatus).map(([status, count]) => (
                    <li key={status}>
                      <AdvertisementPill>
                        {CAMPAIGN_STATUS_LABELS[status as keyof typeof CAMPAIGN_STATUS_LABELS]}: {formatCount(count ?? 0)}
                      </AdvertisementPill>
                    </li>
                  ))}
                </ul>
              </section>
              <section className="space-y-2">
                <h2 className="text-lg font-semibold text-foreground">Advertisers by status</h2>
                <ul className="flex flex-wrap gap-2">
                  {Object.entries(data.advertisersByStatus).map(([status, count]) => (
                    <li key={status}>
                      <AdvertisementPill>
                        {status}: {formatCount(count ?? 0)}
                      </AdvertisementPill>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>
        ) : null}
      </AdvertisementQueryState>
      <AdvertisementBackendGap section={section} />
    </AdvertisementSectionLayout>
  )
}
