import { useEffect, useRef, useState } from 'react'
import { Check, ImageIcon, Loader2, Upload, X } from 'lucide-react'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { useAdLibrary, useAdLibraryActions } from '../hooks/useAdLibrary'
import type { AdAsset } from '../types/advertiser.types'
import { resolveAssetUrl } from '../utils/assetUrl'
import type { PlacementSpec } from '../utils/placements'

const ACCEPTED_TYPES = 'image/jpeg,image/png,image/webp,image/gif'
const ASPECT_TOLERANCE = 0.02

// A placement fits when the image has its aspect ratio and is at least the recommended size, so it isn't upscaled.
function fittingPlacements(asset: AdAsset, specs: PlacementSpec[]): PlacementSpec[] {
  if (!asset.width || !asset.height) return []
  const ratio = asset.width / asset.height
  return specs.filter(
    (spec) =>
      Math.abs(ratio / (spec.size.width / spec.size.height) - 1) <= ASPECT_TOLERANCE && asset.width! >= spec.size.width,
  )
}

interface AssetPickerProps {
  open: boolean
  selectedId: string | null
  // Placements the chosen creative will run in; their sizes are recommended and matching images are flagged.
  specs?: PlacementSpec[]
  onSelect: (asset: AdAsset) => void
  onClose: () => void
}

export function AssetPicker({ open, selectedId, specs = [], onSelect, onClose }: AssetPickerProps) {
  const library = useAdLibrary()
  const { upload } = useAdLibraryActions()
  const fileInput = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const handleFile = (file: File | undefined) => {
    if (!file) return
    setError(null)
    upload.mutate(file, {
      onSuccess: (asset) => {
        onSelect(asset)
        onClose()
      },
      onError: (err) => setError(getErrorMessage(err, 'Upload failed.')),
    })
  }

  const assets = library.data ?? []

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="asset-picker-title"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-t-2xl border border-border bg-card shadow-xl sm:rounded-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          <h2 id="asset-picker-title" className="text-base font-semibold text-heading">
            Choose an image
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-muted hover:bg-surface hover:text-heading"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <input
            ref={fileInput}
            type="file"
            accept={ACCEPTED_TYPES}
            className="hidden"
            onChange={(event) => {
              handleFile(event.target.files?.[0])
              event.target.value = ''
            }}
          />
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            disabled={upload.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-accent-border bg-accent-bg px-4 py-4 text-sm font-semibold text-accent hover:bg-accent/10 disabled:opacity-60"
          >
            {upload.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {upload.isPending ? 'Uploading…' : 'Upload a new image'}
          </button>
          <p className="mt-2 text-center text-xs text-text-muted">JPG, PNG, WebP or GIF, up to 5 MB.</p>
          {specs.length > 0 && (
            <div className="mt-3 rounded-xl bg-surface px-3 py-2 text-xs text-text-muted">
              <p className="font-semibold text-heading">Recommended sizes</p>
              <ul className="mt-1 space-y-0.5">
                {specs.map((spec) => (
                  <li key={spec.id}>
                    {spec.label}: {spec.sizeLabel}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {error && (
            <p role="alert" className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="mt-5">
            {library.isLoading ? (
              <div className="flex justify-center py-8 text-text-muted">
                <Loader2 className="h-5 w-5 animate-spin" aria-label="Loading images" />
              </div>
            ) : library.isError ? (
              <p className="py-6 text-center text-sm text-red-600">{getErrorMessage(library.error, 'Could not load your library.')}</p>
            ) : assets.length === 0 ? (
              <div className="py-6 text-center text-sm text-text-muted">
                <ImageIcon className="mx-auto mb-2 h-6 w-6" aria-hidden="true" />
                Your ad library is empty. Upload an image to get started.
              </div>
            ) : (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {assets.map((asset) => {
                  const selected = asset.id === selectedId
                  const fits = fittingPlacements(asset, specs)
                  return (
                    <li key={asset.id}>
                      <button
                        type="button"
                        onClick={() => {
                          onSelect(asset)
                          onClose()
                        }}
                        aria-pressed={selected}
                        className={`group relative block w-full overflow-hidden rounded-xl border text-left transition ${
                          selected ? 'border-accent ring-2 ring-accent' : 'border-border hover:border-accent-border'
                        }`}
                      >
                        <img
                          src={resolveAssetUrl(asset.url)}
                          alt={asset.name}
                          className="aspect-video w-full bg-surface object-cover"
                          loading="lazy"
                        />
                        <span className="block truncate px-2 py-1.5 text-xs font-medium text-heading">{asset.name}</span>
                        {asset.width && asset.height && (
                          <span className="block px-2 pb-1.5 text-[10px] text-text-muted">
                            {asset.width} × {asset.height}
                          </span>
                        )}
                        {fits.length > 0 && (
                          <span className="block px-2 pb-1.5 text-[10px] font-medium text-emerald-600">
                            Fits {fits.map((spec) => spec.label).join(', ')}
                          </span>
                        )}
                        {selected && (
                          <span className="absolute right-2 top-2 rounded-full bg-accent p-1 text-white">
                            <Check className="h-3 w-3" />
                          </span>
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
