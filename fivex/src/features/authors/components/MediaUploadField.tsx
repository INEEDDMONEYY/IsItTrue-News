import { useRef, useState } from 'react'
import { ImagePlus, Loader2, Video, X } from 'lucide-react'
import { useMediaUpload } from '../hooks/useMediaUpload'
import { getErrorMessage } from '@/lib/getErrorMessage'

interface MediaUploadFieldProps {
  label: string
  helperText?: string
  accept: string
  kind: 'image' | 'video'
  value: string | null
  onChange: (url: string | null) => void
}

/**
 * A single file-upload field with a preview. Selecting a file uploads it to
 * Cloudinary via the backend /api/media endpoint; the real, persisted URL is
 * passed up through onChange once the upload completes.
 */
export function MediaUploadField({
  label,
  helperText,
  accept,
  kind,
  value,
  onChange,
}: MediaUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { upload, isUploading } = useMediaUpload()
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    try {
      const media = await upload(file)
      onChange(media.url)
    } catch (err) {
      setError(getErrorMessage(err, 'Upload failed. Please try again.'))
    } finally {
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const handleRemove = () => {
    onChange(null)
    setError(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div>
      <label className="block text-xs text-text-muted mb-1.5">{label}</label>
      {helperText && <p className="text-xs text-text-dim mb-1.5">{helperText}</p>}

      {value ? (
        <div className="relative rounded-xl border border-border overflow-hidden w-full max-w-xs">
          {kind === 'image' ? (
            <img src={value} alt={label} className="w-full h-40 object-cover" />
          ) : (
            <video src={value} controls className="w-full h-40 object-cover bg-card-2" />
          )}
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-bg/90 border border-border flex items-center justify-center text-text-muted hover:text-disputed transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="w-full max-w-xs h-28 rounded-xl border border-dashed border-border flex flex-col items-center justify-center gap-1.5 text-text-muted hover:border-accent-border hover:text-accent transition-colors disabled:opacity-50"
        >
          {isUploading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : kind === 'image' ? (
            <ImagePlus className="w-5 h-5" />
          ) : (
            <Video className="w-5 h-5" />
          )}
          <span className="text-xs">{isUploading ? 'Uploading...' : `Upload ${kind}`}</span>
        </button>
      )}

      {error && <p className="text-xs text-disputed mt-1.5">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}

