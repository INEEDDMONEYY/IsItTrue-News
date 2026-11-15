import { AdvertisementSectionLayout } from '../components/AdvertisementSectionLayout'
import { AdvertisementBackendGap } from '../components/AdvertisementBackendGap'
import { AdvertisementQueryState, AdvertisementStatCard } from '../components/AdvertisementPrimitives'
import { useAdvertisementAnalytics } from '../hooks/useAdvertisement'
import { requireAdvertisementSection } from '../utils/advertisementSections'
import { formatCount, formatCtr, formatMoney } from '@/features/advertiser/utils/format'

const section = requireAdvertisementSection('analytics')

export function AdvertisementAnalyticsPage() {
  const { data, isLoading, error } = useAdvertisementAnalytics()

  return (
    <AdvertisementSectionLayout section={section}>
      <AdvertisementQueryState isLoading={isLoading} error={error}>
        {data ? (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <AdvertisementStatCard label="Impressions" value={formatCount(data.totals.impressions)} />
              <AdvertisementStatCard label="Clicks" value={formatCount(data.totals.clicks)} />
              <AdvertisementStatCard label="CTR" value={formatCtr(data.totals.ctr)} />
              <AdvertisementStatCard
                label="Committed revenue"
                value={formatMoney(data.totals.committedCents)}
                note="Campaign budgets; not collected payments"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="py-2 pr-4">Placement</th>
                    <th className="py-2 pr-4">Campaigns</th>
                    <th className="py-2 pr-4">Impressions</th>
                    <th className="py-2 pr-4">Clicks</th>
                    <th className="py-2 pr-4">CTR</th>
                    <th className="py-2 pr-4">Committed</th>
                  </tr>
                </thead>
                <tbody>
                  {data.byPlacement.map((row) => (
                    <tr key={row.placement} className="border-b">
                      <td className="py-2 pr-4 font-medium">{row.label}</td>
                      <td className="py-2 pr-4">{formatCount(row.count)}</td>
                      <td className="py-2 pr-4">{formatCount(row.impressions)}</td>
                      <td className="py-2 pr-4">{formatCount(row.clicks)}</td>
                      <td className="py-2 pr-4">{formatCtr(row.ctr)}</td>
                      <td className="py-2 pr-4">{formatMoney(row.budgetCents)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </AdvertisementQueryState>
      <AdvertisementBackendGap section={section} />
    </AdvertisementSectionLayout>
  )
}
