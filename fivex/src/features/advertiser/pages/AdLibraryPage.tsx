import { useRef, useState } from 'react'
import { Check, ImageIcon, Loader2, Pencil, Trash2, Upload, X } from 'lucide-react'
import { LoaderState } from '@/components/loaders/LoaderState'
import { PageLoader } from '@/components/loaders/PageLoader'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { AdvertiserPageHeader } from '../components/AdvertiserPageHeader'
import { useAdLibrary, useAdLibraryActions } from '../hooks/useAdLibrary'
import type { AdAsset } from '../types/advertiser.types'
import { resolveAssetUrl } from '../utils/assetUrl'
import { formatBytes, formatDate } from '../utils/format'
import { PLACEMENT_SPECS } from '../utils/placements'

function AssetTile({ asset, onError }: { asset: AdAsset; onError: (message: string | null) => void }) {
  const { rename, remove } = useAdLibraryActions()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(asset.name)

  const saveName = () => {
    const next = name.trim()
    if (!next || next === asset.name) {
      setEditing(false)
      setName(asset.name)
      return
    }
    onError(null)
    rename.mutate(
      { id: asset.id, name: next },
      {
        onSuccess: () => setEditing(false),
        onError: (err) => onError(getErrorMessage(err, 'Could not rename the image.')),
      },
    )
  }

  return (
    <li className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <a href={resolveAssetUrl(asset.url)} target="_blank" rel="noreferrer" className="block bg-surface">
        <img src={resolveAssetUrl(asset.url)} alt={asset.name} loading="lazy" className="aspect-video w-full object-contain" />
      </a>
      <div className="flex flex-1 flex-col p-3">
        {editing ? (
          <form
            className="flex items-center gap-1"
            onSubmit={(event) => {
              event.preventDefault()
              saveName()
            }}
          >
            <input
              autoFocus
              value={name}
              maxLength={120}
              onChange={(event) => setName(event.target.value)}
              aria-label="Image name"
              className="min-w-0 flex-1 rounded-lg border border-border bg-bg px-2 py-1 text-sm text-heading focus:border-accent focus:outline-none"
            />
            <button type="submit" disabled={rename.isPending} className="rounded-lg p-1.5 text-emerald-600 hover:bg-surface" aria-label="Save name">
              {rename.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false)
                setName(asset.name)
              }}
              className="rounded-lg p-1.5 text-text-muted hover:bg-surface"
              aria-label="Cancel rename"
            >
              <X className="h-4 w-4" />
            </button>
          </form>
        ) : (
          <p className="truncate text-sm font-semibold text-heading" title={asset.name}>
            {asset.name}
          </p>
        )}
        <p className="mt-1 text-xs text-text-muted">
          {[asset.width && asset.height ? `${asset.width} × ${asset.height}` : null, asset.format.toUpperCase(), formatBytes(asset.bytes)]
            .filter(Boolean)
            .join(' · ')}
        </p>
        <p className="mt-0.5 text-xs text-text-dim">
          Uploaded {formatDate(asset.createdAt)} · {asset.usedBy === 0 ? 'Not used' : `Used by ${asset.usedBy} campaign${asset.usedBy === 1 ? '' : 's'}`}
        </p>

        <div className="mt-auto flex gap-1.5 pt-3">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs font-medium text-text hover:bg-surface"
          >
            <Pencil className="h-3.5 w-3.5" />
            Rename
          </button>
          <button
            type="button"
            disabled={remove.isPending}
            onClick={() => {
              if (!window.confirm(`Delete "${asset.name}"? It will be removed from any draft campaigns using it.`)) return
              onError(null)
              remove.mutate(asset.id, { onError: (err) => onError(getErrorMessage(err, 'Could not delete the image.')) })
            }}
            className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-500/10 disabled:opacity-50"
          >
            {remove.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            Delete
          </button>
        </div>
      </div>
    </li>
  )
}

export function AdLibraryPage() {
  const library = useAdLibrary()
  const { upload } = useAdLibraryActions()
  const fileInput = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFiles = async (files: FileList | null) => {
    if (!files) return
    setError(null)
    for (const file of Array.from(files)) {
      try {
        await upload.mutateAsync(file)
      } catch (err) {
        setError(`${file.name}: ${getErrorMessage(err, 'Upload failed.')}`)
        return
      }
    }
  }

  const assets = library.data ?? []

  return (
    <div className="mx-auto w-full max-w-7xl">
      <AdvertiserPageHeader title="Ad Library" description="Upload the images your advertisements use. One image can be reused across campaigns.">
        <input
          ref={fileInput}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(event) => {
            void handleFiles(event.target.files)
            event.target.value = ''
          }}
        />
        <button
          type="button"
          disabled={upload.isPending}
          onClick={() => fileInput.current?.click()}
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-accent-hover disabled:opacity-60"
        >
          {upload.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {upload.isPending ? 'Uploading…' : 'Upload images'}
        </button>
      </AdvertiserPageHeader>

      <div className="mb-5 rounded-2xl border border-border bg-card p-4 text-sm shadow-sm">
        <p className="font-semibold text-heading">Recommended sizes</p>
        <ul className="mt-2 grid grid-cols-1 gap-x-6 gap-y-1 text-xs text-text-muted sm:grid-cols-2 lg:grid-cols-3">
          {PLACEMENT_SPECS.map((spec) => (
            <li key={spec.id}>
              <span className="font-medium text-heading">{spec.label}:</span> {spec.sizeLabel}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-text-dim">JPG, PNG, WebP or GIF, up to 5 MB each.</p>
      </div>

      {error && (
        <p role="alert" className="mb-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {library.isLoading ? (
        <PageLoader label="Loading your library…" />
      ) : library.isError ? (
        <LoaderState alert title="Couldn't load your library" message={getErrorMessage(library.error)}>
          <button type="button" onClick={() => library.refetch()} className="text-sm font-semibold text-accent hover:underline">
            Try again
          </button>
        </LoaderState>
      ) : assets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <ImageIcon className="mx-auto h-8 w-8 text-text-dim" aria-hidden="true" />
          <p className="mt-2 text-sm font-semibold text-heading">No images yet</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-text-muted">Upload a banner or product image to use it in your advertisements.</p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {assets.map((asset) => (
            <AssetTile key={asset.id} asset={asset} onError={setError} />
          ))}
        </ul>
      )}
    </div>
  )
}
