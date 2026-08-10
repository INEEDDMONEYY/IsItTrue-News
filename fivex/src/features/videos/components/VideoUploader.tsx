import { Upload, Video } from 'lucide-react'
import { useRef, useState } from 'react'

interface VideoUploaderProps {
  onFileSelected?: (file: File) => void
}

export default function VideoUploader({
  onFileSelected,
}: VideoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFile = (file?: File) => {
    if (!file) return

    if (!file.type.startsWith('video/')) {
      return
    }

    onFileSelected?.(file)
  }

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event) => {
        event.preventDefault()
        setIsDragging(false)
        handleFile(event.dataTransfer.files?.[0])
      }}
      className={[
        'rounded-2xl border-2 border-dashed p-10 text-center transition',
        isDragging
          ? 'border-sky-400 bg-sky-50'
          : 'border-slate-200 bg-white hover:border-slate-300',
      ].join(' ')}
    >
      <div className="mx-auto flex max-w-md flex-col items-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
          <Video className="h-6 w-6" />
        </div>

        <h3 className="text-lg font-semibold text-slate-900">
          Upload a video
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          Drag and drop your video here, or choose a file from your
          computer.
        </p>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <Upload className="h-4 w-4" />
          Choose Video
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          hidden
          onChange={(event) => {
            handleFile(event.target.files?.[0])
          }}
        />
      </div>
    </div>
  )
}