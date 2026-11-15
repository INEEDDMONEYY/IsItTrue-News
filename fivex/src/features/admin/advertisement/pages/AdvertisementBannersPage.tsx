import { AdvertisementSectionLayout } from '../components/AdvertisementSectionLayout'
import { requireAdvertisementSection } from '../utils/advertisementSections'
import { BannersPage } from '@/features/admin/banners/pages/BannersPage'

const section = requireAdvertisementSection('banners')

export function AdvertisementBannersPage() {
  return (
    <AdvertisementSectionLayout section={section} showHeader={false}>
      <BannersPage />
    </AdvertisementSectionLayout>
  )
}
