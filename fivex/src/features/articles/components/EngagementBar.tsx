import { useState } from 'react'
import { ThumbsUp, ThumbsDown, MessageCircle, Repeat2, ShieldCheck } from 'lucide-react'

function formatCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}m`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

interface EngagementBarProps {
  likes: number
  dislikes: number
  commentsCount: number
  reposts: number
  onCommentClick: () => void
  onFactCheckClick: () => void
}

export function EngagementBar({
  likes,
  dislikes,
  commentsCount,
  reposts,
  onCommentClick,
  onFactCheckClick,
}: EngagementBarProps) {
  const [reaction, setReaction] = useState<'like' | 'dislike' | null>(null)
  const [reposted, setReposted] = useState(false)

  const likeCount = likes + (reaction === 'like' ? 1 : 0)
  const dislikeCount = dislikes + (reaction === 'dislike' ? 1 : 0)
  const repostCount = reposts + (reposted ? 1 : 0)

  return (
    <div className="flex items-center flex-wrap gap-2 py-3 border-y border-border">
      <button
        onClick={() => setReaction((prev) => (prev === 'like' ? null : 'like'))}
        aria-pressed={reaction === 'like'}
        className={`flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-full border transition-colors ${
          reaction === 'like'
            ? 'bg-accent text-white border-accent'
            : 'border-border text-heading hover:border-accent-border hover:text-accent'
        }`}
      >
        <ThumbsUp className="w-4 h-4" />
        {formatCount(likeCount)}
      </button>

      <button
        onClick={() => setReaction((prev) => (prev === 'dislike' ? null : 'dislike'))}
        aria-pressed={reaction === 'dislike'}
        className={`flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-full border transition-colors ${
          reaction === 'dislike'
            ? 'bg-card-2 text-heading border-border'
            : 'border-border text-heading hover:border-accent-border hover:text-accent'
        }`}
      >
        <ThumbsDown className="w-4 h-4" />
        {formatCount(dislikeCount)}
      </button>

      <button
        onClick={onCommentClick}
        className="flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-full border border-border text-heading hover:border-accent-border hover:text-accent transition-colors"
      >
        <MessageCircle className="w-4 h-4" />
        {formatCount(commentsCount)}
      </button>

      <button
        onClick={() => setReposted((prev) => !prev)}
        aria-pressed={reposted}
        className={`flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-full border transition-colors ${
          reposted
            ? 'bg-verified/10 text-verified border-verified/30'
            : 'border-border text-heading hover:border-accent-border hover:text-accent'
        }`}
      >
        <Repeat2 className="w-4 h-4" />
        {formatCount(repostCount)}
      </button>

      <button
        onClick={onFactCheckClick}
        className="ml-auto flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-full border border-accent-border text-accent hover:bg-accent-bg transition-colors"
      >
        <ShieldCheck className="w-4 h-4" />
        Fact-check status
      </button>
    </div>
  )
}
