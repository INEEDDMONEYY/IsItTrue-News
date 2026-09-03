import { ThumbsUp, ThumbsDown, MessageCircle, Repeat2, Bookmark, ShieldCheck } from 'lucide-react'

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
  bookmarks: number
  liked?: boolean
  disliked?: boolean
  reposted?: boolean
  bookmarked?: boolean
  /** Anonymous visitors see a dimmed bookmark icon that opens a sign-up prompt instead of toggling. */
  bookmarkInactive?: boolean
  onLike: () => void
  onDislike: () => void
  onShare: () => void
  onBookmark: () => void
  onCommentClick: () => void
  onFactCheckClick: () => void
}

export function EngagementBar({
  likes,
  dislikes,
  commentsCount,
  reposts,
  bookmarks,
  liked = false,
  disliked = false,
  reposted = false,
  bookmarked = false,
  bookmarkInactive = false,
  onLike,
  onDislike,
  onShare,
  onBookmark,
  onCommentClick,
  onFactCheckClick,
}: EngagementBarProps) {
  return (
    <div className="flex items-center flex-wrap gap-2 py-3 border-y border-border">
      <button
        onClick={onLike}
        aria-pressed={liked}
        className={`flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-full border transition-colors ${
          liked
            ? 'bg-accent text-white border-accent'
            : 'border-border text-heading hover:border-accent-border hover:text-accent'
        }`}
      >
        <ThumbsUp className="w-4 h-4" />
        {formatCount(likes)}
      </button>

      <button
        onClick={onDislike}
        aria-pressed={disliked}
        className={`flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-full border transition-colors ${
          disliked
            ? 'bg-card-2 text-heading border-border'
            : 'border-border text-heading hover:border-accent-border hover:text-accent'
        }`}
      >
        <ThumbsDown className="w-4 h-4" />
        {formatCount(dislikes)}
      </button>

      <button
        onClick={onCommentClick}
        className="flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-full border border-border text-heading hover:border-accent-border hover:text-accent transition-colors"
      >
        <MessageCircle className="w-4 h-4" />
        {formatCount(commentsCount)}
      </button>

      <button
        onClick={onShare}
        aria-pressed={reposted}
        className={`flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-full border transition-colors ${
          reposted
            ? 'bg-verified/10 text-verified border-verified/30'
            : 'border-border text-heading hover:border-accent-border hover:text-accent'
        }`}
      >
        <Repeat2 className="w-4 h-4" />
        {formatCount(reposts)}
      </button>

      <button
        onClick={onBookmark}
        aria-pressed={bookmarked}
        title={bookmarkInactive ? 'Sign up to bookmark stories' : undefined}
        className={`flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-full border transition-colors ${
          bookmarkInactive
            ? 'border-border text-text-dim opacity-60 hover:opacity-100'
            : bookmarked
              ? 'bg-accent text-white border-accent'
              : 'border-border text-heading hover:border-accent-border hover:text-accent'
        }`}
      >
        <Bookmark className={`w-4 h-4 ${bookmarked && !bookmarkInactive ? 'fill-current' : ''}`} />
        {formatCount(bookmarks)}
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
