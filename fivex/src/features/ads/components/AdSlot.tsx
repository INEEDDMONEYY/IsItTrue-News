import { useEffect, useState } from 'react'
import { adClickUrl, adsApi, type AdRequest, type PublicAd } from '../api/ads.api'
import { usePublicAd } from '../hooks/usePublicAd'

interface AdSlotProps extends AdRequest {
  className?: string
  // "split" puts the image on the left and the copy and CTA on the right on wider screens.
  layout?: 'stacked' | 'split'
}

// Aspect ratios match the advertiser placement specs, so creatives render at the size they were built for.
const RATIO: Record<AdRequest['placement'], string> = {
  header: '728 / 90',
  footer: '970 / 90',
  sidepage: '300 / 250',
  selected_page: '1200 / 628',
  newsletter: '600 / 300',
  vendor_listing: '600 / 300',
  premium_vendor_listing: '600 / 300',
  homepage_sponsor: '970 / 250',
  exclusive_homepage_sponsor: '1200 / 400',
  newsletter_sponsor: '600 / 300',
  sponsored_article: '1200 / 628',
  section_ad: '600 / 300',
}

function SponsoredLabel({ advertiserName }: { advertiserName: string }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-wide text-text-dim">
      Sponsored{advertiserName && ` · ${advertiserName}`}
    </p>
  )
}

function Cta({ label }: { label: string }) {
  return (
    <span className="inline-flex shrink-0 items-center rounded-md bg-black px-3 py-1.5 text-xs font-semibold text-white">
      {label || 'Learn more'}
    </span>
  )
}

function AdImage({ ad }: { ad: PublicAd }) {
  if (!ad.imageUrl) return null
  return (
    <img
      src={ad.imageUrl}
      alt={ad.headline || 'Sponsored'}
      className="block w-full rounded-md object-cover"
      style={{ aspectRatio: RATIO[ad.placement] }}
      loading="lazy"
    />
  )
}

function AdCreative({ ad, className, split }: { ad: PublicAd; className: string; split: boolean }) {
  const [node, setNode] = useState<HTMLElement | null>(null)
  useImpressionTracking(node, ad.campaignId)

  const copy = (
    <>
      {ad.placement === 'header' || ad.placement === 'footer' ? (
        !ad.imageUrl && (
          <div className="flex items-center justify-between gap-3 rounded-md bg-accent-bg px-4 py-3">
            <p className="truncate text-sm font-semibold text-heading">{ad.headline}</p>
            <Cta label={ad.ctaLabel} />
          </div>
        )
      ) : (
        <div className="flex min-w-0 flex-col gap-1.5">
          {ad.headline && <p className="text-sm font-semibold text-heading">{ad.headline}</p>}
          {ad.body && <p className="text-sm text-text-muted">{ad.body}</p>}
          <div className="mt-1">
            <Cta label={ad.ctaLabel} />
          </div>
        </div>
      )}
    </>
  )

  const body = split ? (
    <>
      {ad.imageUrl && (
        <div className="sm:w-2/5 sm:shrink-0">
          <AdImage ad={ad} />
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <SponsoredLabel advertiserName={ad.advertiserName} />
        {copy}
      </div>
    </>
  ) : (
    <>
      <SponsoredLabel advertiserName={ad.advertiserName} />
      <AdImage ad={ad} />
      {copy}
    </>
  )

  const layoutClass = split ? 'sm:flex-row sm:items-center sm:gap-4' : ''
  const frame = `flex flex-col gap-2 overflow-hidden rounded-xl bg-card p-3 ${layoutClass} ${className}`
  if (!ad.destinationUrl) {
    return (
      <div ref={setNode} className={frame}>
        {body}
      </div>
    )
  }
  return (
    <a
      ref={setNode}
      href={adClickUrl(ad.campaignId)}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={`${frame} transition-opacity hover:opacity-90`}
    >
      {body}
    </a>
  )
}

// Counts one impression per mounted ad, once at least half of it is on screen. Browsers without IntersectionObserver count on mount.
function useImpressionTracking(node: HTMLElement | null, campaignId: string) {
  useEffect(() => {
    if (!node) return
    if (typeof IntersectionObserver === 'undefined') {
      adsApi.recordImpression(campaignId).catch(() => undefined)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        adsApi.recordImpression(campaignId).catch(() => undefined)
      },
      { threshold: 0.5 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [node, campaignId])
}

// Renders nothing when there is no live campaign, so an empty slot leaves no gap or placeholder on the public site.
export function AdSlot({ className = '', layout = 'stacked', ...request }: AdSlotProps) {
  const ad = usePublicAd(request)
  if (!ad) return null
  return <AdCreative ad={ad} className={className} split={layout === 'split'} />
}
