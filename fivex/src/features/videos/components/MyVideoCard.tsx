import {
  Eye,
  Heart,
  MessageSquare,
  MoreVertical,
  Pencil,
  Play,
} from 'lucide-react'
import type { MyVideo } from '@/features/videos/types/myVideo.types'
import { MyVideoStatusBadge } from './MyVideoStatusBadge'

interface MyVideoCardProps {
  video: MyVideo
  onEdit?: (video: MyVideo) => void
  onOpen?: (video: MyVideo) => void
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export function MyVideoCard({
  video,
  onEdit,
  onOpen,
}: MyVideoCardProps) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <button
        type="button"
        onClick={() => onOpen?.(video)}
        className="relative block w-full overflow-hidden bg-[var(--color-card-2)] text-left"
      >
        <img
          src={video.thumbnailUrl}
          alt=""
          className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />

        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/20">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-[var(--color-accent)] opacity-0 shadow-lg transition group-hover:opacity-100">
            <Play className="ml-0.5 h-5 w-5 fill-current" />
          </span>
        </div>

        <span className="absolute bottom-3 right-3 rounded-md bg-black/80 px-2 py-1 text-xs font-medium text-white">
          {formatDuration(video.duration)}
        </span>
      </button>

      <div className="p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <MyVideoStatusBadge status={video.status} />

          <button
            type="button"
            className="rounded-lg p-1.5 text-[var(--color-card-text-muted)] transition hover:bg-[var(--color-card-2)] hover:text-[var(--color-card-heading)]"
            aria-label="More video actions"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => onOpen?.(video)}
          className="text-left"
        >
          <h3 className="line-clamp-2 text-base font-bold text-[var(--color-card-heading)] transition-colors group-hover:text-[var(--color-accent)]">
            {video.title}
          </h3>
        </button>

        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--color-card-text-muted)]">
          {video.description}
        </p>

        <div className="mt-4 flex items-center justify-between text-xs text-[var(--color-card-text-muted)]">
          <span>{video.category}</span>
          <span className="capitalize">
            {video.visibility}
          </span>
        </div>

        <div className="mt-4 flex items-center gap-4 border-t border-[var(--color-card-border)] pt-4 text-xs text-[var(--color-card-text-muted)]">
          <span className="inline-flex items-center gap-1.5">
            <Eye className="h-4 w-4" />
            {video.views.toLocaleString()}
          </span>

          <span className="inline-flex items-center gap-1.5">
            <Heart className="h-4 w-4" />
            {video.likes.toLocaleString()}
          </span>

          <span className="inline-flex items-center gap-1.5">
            <MessageSquare className="h-4 w-4" />
            {video.comments.toLocaleString()}
          </span>

          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(video)}
              className="ml-auto inline-flex items-center gap-1.5 font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>
          )}
        </div>
      </div>
    </article>
  )
}