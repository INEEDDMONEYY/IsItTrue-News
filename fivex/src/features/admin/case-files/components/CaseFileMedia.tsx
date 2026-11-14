
import {
  FileText,
  Image as ImageIcon,
  PlayCircle,
  Video,
} from 'lucide-react'
import type { CaseFileLinkedItem } from '../types/caseFile.types'

interface CaseFileMediaProps {
  media: CaseFileLinkedItem[]
  loading?: boolean
  onMediaClick?: (media: CaseFileLinkedItem) => void
  emptyMessage?: string
}

function getMediaKind(type: string) {
  const normalized = type.toLowerCase()

  if (
    normalized.includes('video') ||
    normalized.includes('recording') ||
    normalized.includes('footage')
  ) {
    return 'video'
  }

  if (
    normalized.includes('image') ||
    normalized.includes('photo') ||
    normalized.includes('graphic')
  ) {
    return 'image'
  }

  return 'document'
}

function getMediaIcon(type: string) {
  const kind = getMediaKind(type)

  if (kind === 'video') return Video
  if (kind === 'image') return ImageIcon

  return FileText
}

export function CaseFileMedia({
  media,
  loading = false,
  onMediaClick,
  emptyMessage = 'No media has been added to this case file yet.',
}: CaseFileMediaProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800"
          >
            <div className="aspect-video bg-neutral-200 dark:bg-neutral-800" />
            <div className="space-y-2 p-4">
              <div className="h-3 w-3/4 rounded bg-neutral-200 dark:bg-neutral-800" />
              <div className="h-3 w-1/2 rounded bg-neutral-100 dark:bg-neutral-800/70" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (media.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-300 px-5 py-10 text-center dark:border-neutral-700">
        <ImageIcon className="mx-auto h-8 w-8 text-neutral-400" />
        <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
          {emptyMessage}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {media.map((item) => {
        const Icon = getMediaIcon(item.type)
        const kind = getMediaKind(item.type)
        const isInteractive = Boolean(onMediaClick)

        const content = (
          <>
            <div className="relative aspect-video overflow-hidden bg-neutral-100 dark:bg-neutral-800">
              {item.thumbnailUrl ? (
                <img
                  src={item.thumbnailUrl}
                  alt={item.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-neutral-400 dark:text-neutral-500">
                  <Icon className="h-10 w-10" />
                </div>
              )}

              {kind === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                  <PlayCircle className="h-11 w-11 text-white drop-shadow-lg" />
                </div>
              )}

              <span className="absolute bottom-2 left-2 rounded-md bg-black/70 px-2 py-1 text-xs font-medium capitalize text-white">
                {kind}
              </span>
            </div>

            <div className="p-4">
              <h4 className="truncate text-sm font-semibold text-neutral-900 dark:text-white">
                {item.title}
              </h4>

              {item.description && (
                <p className="mt-1 line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">
                  {item.description}
                </p>
              )}

              <div className="mt-3 flex items-center justify-between gap-2 text-xs text-neutral-500 dark:text-neutral-500">
                <span className="truncate">{item.type}</span>
                {item.createdAt && (
                  <span className="shrink-0">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </>
        )

        const className =
          'group block w-full overflow-hidden rounded-xl border border-neutral-200 bg-white text-left transition-colors dark:border-neutral-800 dark:bg-neutral-900'

        return isInteractive ? (
          <button
            key={item.id}
            type="button"
            onClick={() => onMediaClick?.(item)}
            className={`${className} hover:border-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 dark:hover:border-neutral-600`}
          >
            {content}
          </button>
        ) : (
          <article key={item.id} className={className}>
            {content}
          </article>
        )
      })}
    </div>
  )
}
