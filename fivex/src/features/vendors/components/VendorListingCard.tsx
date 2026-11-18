import { resolveAssetUrl } from '@/features/advertiser/utils/assetUrl'
import type { VendorListing } from '../api/vendors.api'

// The dashboard preview shows the advertiser's own profile, which has no campaign id yet.
export type VendorCardData = Omit<VendorListing, 'campaignId'> & { campaignId?: string }

const SOCIAL_LABELS: Record<keyof VendorListing['socialLinks'], string> = {
  linkedin: 'LinkedIn',
  facebook: 'Facebook',
  instagram: 'Instagram',
  x: 'X',
  youtube: 'YouTube',
}

function hrefFor(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`
}

export function VendorListingCard({ vendor }: { vendor: VendorCardData }) {
  const logo = resolveAssetUrl(vendor.logoUrl)
  const socials = (Object.keys(SOCIAL_LABELS) as (keyof VendorListing['socialLinks'])[]).filter(
    (key) => vendor.socialLinks[key],
  )

  return (
    <article className="flex h-full flex-col gap-3 rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/10">
      <div className="flex items-center gap-3">
        {logo ? (
          <img src={logo} alt="" className="h-12 w-12 shrink-0 rounded-lg object-contain" loading="lazy" />
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-black text-sm font-bold text-white">
            {vendor.businessName.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-heading">{vendor.listingTitle || vendor.businessName}</h3>
          {vendor.listingTitle && <p className="truncate text-xs text-text-muted">{vendor.businessName}</p>}
          {vendor.premium && (
            <span className="mt-0.5 inline-flex rounded-md bg-black px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
              Featured partner
            </span>
          )}
        </div>
      </div>

      {vendor.categories.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label="Categories">
          {vendor.categories.map((category) => (
            <li key={category} className="rounded-md bg-accent-bg px-2 py-0.5 text-xs text-heading">
              {category}
            </li>
          ))}
        </ul>
      )}

      {vendor.listingDescription && <p className="text-sm text-text-muted">{vendor.listingDescription}</p>}
      {vendor.featuredProduct && <p className="text-sm font-medium text-heading">{vendor.featuredProduct}</p>}
      {vendor.services && <p className="line-clamp-3 text-sm text-text-muted">{vendor.services}</p>}

      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-2 text-xs">
        {vendor.website && (
          <a
            href={hrefFor(vendor.website)}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="font-semibold text-heading underline underline-offset-2 hover:no-underline"
          >
            Visit website
          </a>
        )}
        {socials.map((key) => (
          <a
            key={key}
            href={vendor.socialLinks[key]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-muted underline underline-offset-2 hover:text-heading"
          >
            {SOCIAL_LABELS[key]}
          </a>
        ))}
      </div>
    </article>
  )
}
