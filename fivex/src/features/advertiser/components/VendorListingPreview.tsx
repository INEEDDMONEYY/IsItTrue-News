import { useAdvertiserAuth } from '@/app/providers/AdvertiserAuthProvider'
import { VendorListingCard, type VendorCardData } from '@/features/vendors/components/VendorListingCard'
import { useAdvertiserVisibility } from '../hooks/useAdvertiserVisibility'

// Shows how the advertiser's profile appears in the public "Platform supporters" section.
export function VendorListingPreview() {
  const { advertiser } = useAdvertiserAuth()
  const visibility = useAdvertiserVisibility()
  if (!advertiser) return null

  const profile = advertiser.profile
  const vendor: VendorCardData = {
    premium: false,
    businessName: advertiser.businessName,
    logoUrl: profile?.logoUrl,
    website: profile?.website ?? '',
    listingTitle: profile?.listingTitle ?? '',
    listingDescription: profile?.listingDescription ?? '',
    categories: profile?.categories ?? [],
    featuredProduct: profile?.featuredProduct ?? '',
    services: profile?.services ?? '',
    socialLinks: profile?.socialLinks ?? {},
  }
  const live = visibility.data?.vendorDirectoryListed === true

  return (
    <section aria-labelledby="vendor-listing-preview" className="space-y-4">
      <div>
        <h2 id="vendor-listing-preview" className="text-base font-semibold text-foreground sm:text-lg">
          Vendor listing preview
        </h2>
        <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
          {live
            ? 'This is how your business appears under Platform supporters on every page and at the end of each article.'
            : 'Your listing is not live yet. It appears under Platform supporters once a vendor listing campaign is approved and running.'}
        </p>
      </div>
      <div className="max-w-md space-y-3">
        <div
          role="note"
          className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 sm:text-sm"
        >
          Keep your Business profile up to date for the most accurate listing. This preview shows exactly what
          visitors see, and it stays this way until you change your profile in Business profile settings.
        </div>
        <VendorListingCard vendor={vendor} />
      </div>
    </section>
  )
}
