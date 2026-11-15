import { AdvertisementSectionLayout } from '../components/AdvertisementSectionLayout'
import { requireAdvertisementSection } from '../utils/advertisementSections'
import { PromotionalReferralCodesPage } from './PromotionalReferralCodesPage'

const section = requireAdvertisementSection('promotional-referral-codes')

export function AdvertisementPromotionalReferralCodesPage() {
  return (
    <AdvertisementSectionLayout section={section} showHeader={false}>
      <PromotionalReferralCodesPage />
    </AdvertisementSectionLayout>
  )
}
