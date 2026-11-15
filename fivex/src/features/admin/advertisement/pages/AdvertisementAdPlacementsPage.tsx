import { AdvertisementSectionLayout } from '../components/AdvertisementSectionLayout'
import { AdvertisementBackendGap } from '../components/AdvertisementBackendGap'
import { AdvertisementQueryState, AdvertisementPill, AdvertisementStatCard } from '../components/AdvertisementPrimitives'
import { usePlacements } from '../hooks/useAdvertisement'
import { requireAdvertisementSection } from '../utils/advertisementSections'
import { formatCount, formatCtr, formatMoney } from '@/features/advertiser/utils/format'

const section = requireAdvertisementSection('ad-placements')

export function AdvertisementAdPlacementsPage() {
  const { data, isLoading, error } = usePlacements()

  return (
    <AdvertisementSectionLayout section={section}>
      <AdvertisementQueryState isLoading={isLoading} error={error}>
        {data ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.map((placement) => (
              <div key={placement.placement} className="space-y-3 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-foreground">{placement.label}</h2>
                  <AdvertisementPill>{formatCount(placement.liveCampaigns)} live</AdvertisementPill>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatCount(placement.pendingCampaigns)} pending review · {formatCount(placement.count)} total
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <AdvertisementStatCard label="Impressions" value={formatCount(placement.impressions)} />
                  <AdvertisementStatCard label="CTR" value={formatCtr(placement.ctr)} />
                </div>
                <p className="text-xs text-muted-foreground">
                  Requires image: {placement.requirements.imageRequired ? 'yes' : 'no'} · body text:{' '}
                  {placement.requirements.bodyRequired ? 'yes' : 'no'} · committed {formatMoney(placement.budgetCents)}
                </p>
              </div>
            ))}
          </div>
        ) : null}
      </AdvertisementQueryState>
      <AdvertisementBackendGap section={section} />
    </AdvertisementSectionLayout>
  )
}
