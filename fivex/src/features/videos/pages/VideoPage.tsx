import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Eye, ThumbsUp, MessageSquare } from 'lucide-react'
import { mockMyVideos } from '@/features/videos/data/mockMyVideos'

function formatCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}m`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`
  return String(n)
}

export function VideoPage() {
  const { id } = useParams<{ id: string }>()
  const video = mockMyVideos.find((v) => v.id === id && v.visibility === 'public')

  if (!video) {
    return (
      <div className="py-16 flex flex-col items-center text-center gap-3">
        <h1 className="text-2xl font-semibold text-heading">Video not found</h1>
        <Link to="/videos" className="text-sm text-accent hover:underline">
          Back to videos
        </Link>
      </div>
    )
  }

  return (
    <div className="py-6 md:py-10 flex flex-col gap-6 max-w-3xl mx-auto">
      <Link
        to="/videos"
        className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text w-fit"
      >
        <ArrowLeft className="w-4 h-4" /> Back to videos
      </Link>

      <div className="relative aspect-video rounded-2xl overflow-hidden border border-border bg-black">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="absolute inset-0 w-full h-full object-cover opacity-70"
        />
      </div>

      <div>
        <span className="text-[11px] uppercase tracking-wide text-accent font-medium">
          {video.category}
        </span>
        <h1 className="mt-1 text-xl md:text-2xl font-semibold text-heading">{video.title}</h1>
        <p className="mt-2 text-sm text-text-muted leading-relaxed">{video.description}</p>

        <div className="mt-4 flex items-center gap-4 text-xs text-text-dim">
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" /> {formatCount(video.views)} views
          </span>
          <span className="flex items-center gap-1">
            <ThumbsUp className="w-3.5 h-3.5" /> {formatCount(video.likes)}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5" /> {formatCount(video.comments)}
          </span>
        </div>
      </div>
    </div>
  )
}
