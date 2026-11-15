import { AdvertisementSectionLayout } from '../components/AdvertisementSectionLayout'
import { AdvertisementBackendGap } from '../components/AdvertisementBackendGap'
import { AdvertisementQueryState } from '../components/AdvertisementPrimitives'
import { useScheduling } from '../hooks/useAdvertisement'
import { requireAdvertisementSection } from '../utils/advertisementSections'
import { CampaignTable } from './AdvertisementCampaignsPage'

const section = requireAdvertisementSection('scheduling')

export function AdvertisementSchedulingPage() {
  const { data, isLoading, error } = useScheduling()

  return (
    <AdvertisementSectionLayout section={section}>
      <AdvertisementQueryState
        isLoading={isLoading}
        error={error}
        isEmpty={data?.length === 0}
        emptyMessage="No live or upcoming campaigns are scheduled."
      >
        {data ? <CampaignTable campaigns={data} /> : null}
      </AdvertisementQueryState>
      <AdvertisementBackendGap section={section} />
    </AdvertisementSectionLayout>
  )
}
