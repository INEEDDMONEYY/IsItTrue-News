import { AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import { useActiveBanners } from '@/features/banners/hooks/useBanners'
import type { BannerTone } from '@/features/banners/api/banners.api'

const TONE_STYLES: Record<BannerTone, string> = {
  info: 'bg-accent-bg text-accent border-accent/30',
  warning: 'bg-pending/10 text-pending border-pending/30',
  success: 'bg-verified/10 text-verified border-verified/30',
}

const TONE_ICONS: Record<BannerTone, typeof Info> = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle2,
}

/**
 * Site-wide announcement banners, backed by /api/banners. Rendered at the
 * top of every layout (reader site, dashboard, admin panel) so an active
 * banner created in the admin panel shows up everywhere immediately.
 */
export function BannerBar() {
  const { banners } = useActiveBanners()

  if (banners.length === 0) return null

  return (
    <div className="flex flex-col">
      {banners.map((banner) => {
        const Icon = TONE_ICONS[banner.tone]
        return (
          <div
            key={banner.id}
            className={`w-full border-b px-4 md:px-8 py-2.5 flex items-center justify-center gap-2 text-sm ${TONE_STYLES[banner.tone]}`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="text-center">{banner.message}</span>
          </div>
        )
      })}
    </div>
  )
}
