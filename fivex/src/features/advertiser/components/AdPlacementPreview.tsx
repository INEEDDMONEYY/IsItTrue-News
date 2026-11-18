import type { ReactNode } from 'react'
import { ImageIcon } from 'lucide-react'
import type { CampaignPlacement } from '../types/advertiser.types'
import { PLACEMENT_SPEC_BY_ID } from '../utils/placements'

export interface PreviewCreative {
  headline: string
  body: string
  ctaLabel: string
  destinationUrl: string
  imageUrl?: string
}

interface AdPlacementPreviewProps {
  placement: CampaignPlacement
  creative: PreviewCreative
  brand: string
}

function displayHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return 'yourwebsite.com'
  }
}

function Bar({ className = '' }: { className?: string }) {
  return <div className={`rounded-full bg-surface-2 ${className}`} />
}

function TextLines({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-1.5">
      {Array.from({ length: count }, (_, i) => (
        <Bar key={i} className={`h-1.5 ${i === count - 1 ? 'w-2/3' : 'w-full'}`} />
      ))}
    </div>
  )
}

function SponsoredLabel({ brand }: { brand: string }) {
  return (
    <p className="truncate text-[9px] font-semibold uppercase tracking-wide text-text-dim">
      Sponsored · {brand || 'Your business'}
    </p>
  )
}

function CreativeImage({ src, ratio, alt }: { src?: string; ratio: string; alt: string }) {
  return src ? (
    <img src={src} alt={alt} className="block w-full rounded-md object-cover" style={{ aspectRatio: ratio }} />
  ) : (
    <div
      className="flex w-full items-center justify-center rounded-md border border-dashed border-border bg-surface text-text-dim"
      style={{ aspectRatio: ratio }}
    >
      <ImageIcon className="h-4 w-4" aria-hidden="true" />
    </div>
  )
}

function Cta({ label }: { label: string }) {
  return (
    <span className="inline-flex shrink-0 items-center rounded-md bg-black px-2 py-1 text-[10px] font-semibold text-white">
      {label || 'Learn more'}
    </span>
  )
}

// Wide banners (header/footer) are image-led; without an image the headline and CTA stand in so the slot is still readable.
function Banner({ creative, ratio, brand }: { creative: PreviewCreative; ratio: string; brand: string }) {
  return (
    <div>
      <SponsoredLabel brand={brand} />
      {creative.imageUrl ? (
        <div className="relative mt-1">
          <CreativeImage src={creative.imageUrl} ratio={ratio} alt={creative.headline || 'Ad image'} />
        </div>
      ) : (
        <div
          className="mt-1 flex w-full items-center justify-between gap-2 rounded-md border border-dashed border-border bg-accent-bg px-2"
          style={{ aspectRatio: ratio, minHeight: 28 }}
        >
          <p className="truncate text-[10px] font-semibold text-heading">{creative.headline || 'Your headline'}</p>
          <Cta label={creative.ctaLabel} />
        </div>
      )}
    </div>
  )
}

function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-bg shadow-sm">
      <div className="flex items-center gap-1 border-b border-border bg-surface px-2 py-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        <div className="ml-2 h-2.5 flex-1 rounded-full bg-bg" />
      </div>
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="text-[10px] font-bold text-heading">IsItTrue News</span>
        <div className="flex gap-1.5">
          <Bar className="h-1.5 w-6" />
          <Bar className="h-1.5 w-6" />
          <Bar className="h-1.5 w-6" />
        </div>
      </div>
      {children}
    </div>
  )
}

export function AdPlacementPreview({ placement, creative, brand }: AdPlacementPreviewProps) {
  const { size } = PLACEMENT_SPEC_BY_ID[placement]
  const ratio = `${size.width} / ${size.height}`

  if (placement === 'newsletter') {
    return (
      <div className="overflow-hidden rounded-xl border border-border bg-bg shadow-sm">
        <div className="space-y-0.5 border-b border-border bg-surface px-3 py-2 text-[9px] text-text-muted">
          <p>
            <span className="font-semibold text-heading">From:</span> IsItTrue News
          </p>
          <p className="truncate">
            <span className="font-semibold text-heading">Subject:</span> Today's verified stories
          </p>
        </div>
        <div className="mx-auto max-w-[320px] space-y-3 p-3">
          <Bar className="h-2 w-1/2" />
          <TextLines count={2} />
          <div className="rounded-lg border border-accent-border bg-accent-bg p-2.5">
            <SponsoredLabel brand={brand} />
            {creative.imageUrl && (
              <div className="mt-1.5">
                <CreativeImage src={creative.imageUrl} ratio={ratio} alt={creative.headline || 'Ad image'} />
              </div>
            )}
            <p className="mt-1.5 text-[11px] font-bold leading-snug text-heading">{creative.headline || 'Your headline'}</p>
            <p className="mt-1 line-clamp-3 text-[10px] leading-snug text-text">
              {creative.body || 'A short message for newsletter subscribers.'}
            </p>
            <div className="mt-2">
              <Cta label={creative.ctaLabel} />
            </div>
          </div>
          <TextLines count={2} />
        </div>
      </div>
    )
  }

  return (
    <SiteChrome>
      {placement === 'header' && (
        <div className="border-b border-border px-3 py-2">
          <Banner creative={creative} ratio={ratio} brand={brand} />
        </div>
      )}

      <div className="flex gap-3 p-3">
        <div className="min-w-0 flex-1 space-y-2.5">
          <Bar className="h-2.5 w-3/4" />
          <div className="aspect-[16/7] w-full rounded-md bg-surface" />
          <TextLines count={3} />

          {placement === 'selected_page' && (
            <div className="rounded-lg border border-border bg-surface p-2">
              <SponsoredLabel brand={brand} />
              <div className="mt-1.5 flex gap-2">
                <div className="w-2/5 shrink-0">
                  <CreativeImage src={creative.imageUrl} ratio={ratio} alt={creative.headline || 'Ad image'} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-[11px] font-bold leading-snug text-heading">
                    {creative.headline || 'Your headline'}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-text">
                    {creative.body || 'A short description of your offer.'}
                  </p>
                  <div className="mt-1.5 flex items-center justify-between gap-1">
                    <span className="truncate text-[9px] text-text-dim">{displayHost(creative.destinationUrl)}</span>
                    <Cta label={creative.ctaLabel} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <TextLines count={2} />
        </div>

        <aside className="w-[34%] shrink-0 space-y-2">
          {placement === 'sidepage' ? (
            <div className="rounded-lg border border-border bg-surface p-1.5">
              <SponsoredLabel brand={brand} />
              <div className="mt-1">
                {creative.imageUrl ? (
                  <CreativeImage src={creative.imageUrl} ratio={ratio} alt={creative.headline || 'Ad image'} />
                ) : (
                  <div
                    className="flex w-full flex-col justify-between rounded-md border border-dashed border-border bg-accent-bg p-1.5"
                    style={{ aspectRatio: ratio }}
                  >
                    <p className="line-clamp-3 text-[10px] font-bold leading-snug text-heading">
                      {creative.headline || 'Your headline'}
                    </p>
                    <Cta label={creative.ctaLabel} />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="aspect-[6/5] rounded-md bg-surface" />
          )}
          <TextLines count={3} />
        </aside>
      </div>

      {placement === 'footer' && (
        <div className="border-t border-border px-3 py-2">
          <Banner creative={creative} ratio={ratio} brand={brand} />
        </div>
      )}
      <div className="flex gap-2 border-t border-border bg-surface px-3 py-2">
        <Bar className="h-1.5 w-10" />
        <Bar className="h-1.5 w-10" />
        <Bar className="h-1.5 w-10" />
      </div>
    </SiteChrome>
  )
}
