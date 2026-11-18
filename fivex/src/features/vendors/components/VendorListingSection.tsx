import { useVendorListings } from '../hooks/useVendorListings'
import { VendorListingCard } from './VendorListingCard'

// Shows who supports the platform. Renders nothing when no vendor is live, so pages never show an empty block.
export function VendorListingSection({ className = '' }: { className?: string }) {
  const vendors = useVendorListings()
  if (vendors.length === 0) return null

  return (
    <section aria-labelledby="platform-supporters" className={`mt-12 border-t border-black/10 pt-10 ${className}`}>
      <div className="mb-6">
        <h2 id="platform-supporters" className="text-lg font-semibold text-heading sm:text-xl">
          Platform supporters
        </h2>
        <p className="mt-1 text-sm text-text-muted">The businesses that help keep IITNews independent.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {vendors.map((vendor) => (
          <VendorListingCard key={vendor.campaignId} vendor={vendor} />
        ))}
      </div>
    </section>
  )
}
