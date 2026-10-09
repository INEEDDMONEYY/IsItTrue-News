import type { VideoMetadata as VideoMetadataType } from '@/features/videos/types/videoStudio.types'

interface VideoMetadataProps {
  metadata: VideoMetadataType
  onChange: (
    updates: Partial<VideoMetadataType>,
  ) => void
}

export default function VideoMetadata({
  metadata,
  onChange,
}: VideoMetadataProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-heading">
          Video Metadata
        </h2>

        <p className="mt-1 text-sm text-text-muted">
          Add the information readers and editors need to understand
          this video.
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-text">
            Title
          </label>

          <input
            value={metadata.title}
            onChange={(event) =>
              onChange({ title: event.target.value })
            }
            placeholder="Enter video title"
            className="w-full rounded-xl border border-border px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-text">
            Description
          </label>

          <textarea
            value={metadata.description}
            onChange={(event) =>
              onChange({
                description: event.target.value,
              })
            }
            rows={5}
            placeholder="Describe what this video contains..."
            className="w-full resize-none rounded-xl border border-border px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-text">
              Category
            </label>

            <input
              value={metadata.category}
              onChange={(event) =>
                onChange({
                  category: event.target.value,
                })
              }
              placeholder="News"
              className="w-full rounded-xl border border-border px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-text">
              Location
            </label>

            <input
              value={metadata.location ?? ''}
              onChange={(event) =>
                onChange({
                  location: event.target.value,
                })
              }
              placeholder="Location where recorded"
              className="w-full rounded-xl border border-border px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-text">
            Credit
          </label>

          <input
            value={metadata.credit ?? ''}
            onChange={(event) =>
              onChange({
                credit: event.target.value,
              })
            }
            placeholder="Source or videographer credit"
            className="w-full rounded-xl border border-border px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          />
        </div>
      </div>
    </div>
  )
}