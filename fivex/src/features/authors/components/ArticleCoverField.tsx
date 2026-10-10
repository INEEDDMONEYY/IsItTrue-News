import { useRef, useState } from 'react'
import { ImagePlus, Loader2 } from 'lucide-react'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { useMediaUpload } from '../hooks/useMediaUpload'

interface ArticleCoverFieldProps {
  value: string | null
  onChange: (url: string | null) => void
}

// The lead image, shown at the same 16:9 proportions readers get on the article page so the crop is no surprise.
export function ArticleCoverField({ value, onChange }: ArticleCoverFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { upload, isUploading } = useMediaUpload()
  const [error, setError] = useState<string | null>(null)

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setError(null)
    try {
      const media = await upload(file)
      onChange(media.url)
    } catch (err) {
      setError(getErrorMessage(err, 'Upload failed. Please try again.'))
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {value ? (
        <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-card-2 border border-border">
          <img src={value} alt="Cover" className="w-full h-full object-cover" />
          <div className="absolute right-3 top-3 flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={isUploading}
              className="px-3 py-1.5 rounded-lg bg-bg/90 border border-border text-xs font-medium text-heading hover:text-accent transition-colors disabled:opacity-50"
            >
              {isUploading ? 'Uploading…' : 'Replace'}
            </button>
            <button
              type="button"
              onClick={() => {
                setError(null)
                onChange(null)
              }}
              disabled={isUploading}
              className="px-3 py-1.5 rounded-lg bg-bg/90 border border-border text-xs font-medium text-heading hover:text-disputed transition-colors disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="aspect-[16/9] w-full rounded-2xl border border-dashed border-border flex flex-col items-center justify-center gap-2 text-text-muted hover:border-accent-border hover:text-accent transition-colors disabled:opacity-60"
        >
          {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <ImagePlus className="w-6 h-6" />}
          <span className="text-sm font-medium">{isUploading ? 'Uploading…' : 'Add a cover image'}</span>
          <span className="text-xs text-text-dim">Shown at the top of the article, in 16:9</span>
        </button>
      )}

      {error && (
        <p role="alert" className="text-xs text-disputed">
          {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        aria-label="Cover image file"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  )
}
