import { useState } from 'react'
import { Megaphone, Plus, Trash2 } from 'lucide-react'
import { EmptyStateCard } from '@/components/cards'
import { useBanners } from '@/features/banners/hooks/useBanners'
import type { BannerTone } from '@/features/banners/api/banners.api'
import { getErrorMessage } from '@/lib/getErrorMessage'

const TONE_STYLES: Record<BannerTone, string> = {
  info: 'bg-accent-bg text-accent border-accent/30',
  warning: 'bg-pending/10 text-pending border-pending/30',
  success: 'bg-verified/10 text-verified border-verified/30',
}

export function BannersPage() {
  const { banners, isLoading, error, createBanner, toggleBanner, deleteBanner } = useBanners()
  const [message, setMessage] = useState('')
  const [tone, setTone] = useState<BannerTone>('info')
  const [formError, setFormError] = useState<string | null>(null)

  const handleAdd = async () => {
    const trimmed = message.trim()
    if (!trimmed) return
    setFormError(null)
    try {
      await createBanner(trimmed, tone)
      setMessage('')
      setTone('info')
    } catch (err) {
      setFormError(getErrorMessage(err, 'Failed to create banner.'))
    }
  }

  const handleToggle = (id: string) => {
    toggleBanner(id).catch(() => {
      // Errors are surfaced via the query error state on the next fetch.
    })
  }

  const handleRemove = (id: string) => {
    deleteBanner(id).catch(() => {
      // Errors are surfaced via the query error state on the next fetch.
    })
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-heading mb-1">Banners</h1>
      <p className="text-sm text-text-muted mb-6">
        Site-wide announcement banners shown at the top of every page — the reader site,
        author/editor dashboard, and admin panel.
      </p>

      <div className="rounded-2xl border border-card-border bg-card p-5 mb-6">
        <h2 className="text-sm font-semibold text-card-heading mb-3">New banner</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Banner message"
            className="flex-1 rounded-lg border border-card-border bg-card-2 px-3 py-2 text-sm text-card-heading placeholder:text-card-text-dim outline-none focus:border-accent"
          />
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value as BannerTone)}
            className="rounded-lg border border-card-border bg-card-2 px-3 py-2 text-sm text-card-heading outline-none focus:border-accent"
          >
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="success">Success</option>
          </select>
          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-accent text-white hover:bg-accent/90 transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
        {formError && <p className="text-xs text-disputed mt-2">{formError}</p>}
      </div>

      {isLoading && <p className="text-sm text-text-muted">Loading banners...</p>}
      {error && <p className="text-sm text-disputed">{getErrorMessage(error, 'Failed to load banners.')}</p>}

      <div className="flex flex-col gap-3">
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="rounded-xl border border-card-border bg-card p-4 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span
                className={`shrink-0 text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border ${TONE_STYLES[banner.tone]}`}
              >
                {banner.tone}
              </span>
              <p className="text-sm text-card-heading truncate">{banner.message}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                role="switch"
                aria-checked={banner.active}
                onClick={() => handleToggle(banner.id)}
                title={banner.active ? 'Active' : 'Inactive'}
                className={`relative w-10 h-6 rounded-full transition-colors ${
                  banner.active ? 'bg-accent' : 'bg-card-2'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    banner.active ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
              <button
                type="button"
                onClick={() => handleRemove(banner.id)}
                className="p-1.5 rounded-lg text-card-text-muted hover:text-disputed hover:bg-card-2 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {!isLoading && banners.length === 0 && (
          <EmptyStateCard
            icon={Megaphone}
            title="No banners yet"
            description="Add a banner above to announce something to readers site-wide."
          />
        )}
      </div>
    </div>
  )
}

