import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ThumbsUp } from 'lucide-react'
import dayjs from '@/lib/dayjs'
import type { ArticleComment } from '../types/articleDetail.types'

interface CommentItemProps {
  comment: ArticleComment
  /** Present only for real, backend-sourced comments the viewer can like. */
  onToggleLike?: () => void
}

export function CommentItem({ comment, onToggleLike }: CommentItemProps) {
  const [localLiked, setLocalLiked] = useState(false)
  const isControlled = Boolean(onToggleLike)
  const liked = isControlled ? Boolean(comment.liked) : localLiked
  const likeCount = comment.likes + (isControlled ? 0 : liked ? 1 : 0)
  const initials = comment.authorName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)

  return (
    <div className="flex gap-3 py-4 border-b border-card-border last:border-b-0">
      {comment.authorId ? (
        <Link
          to={`/authors/${comment.authorId}`}
          className="w-9 h-9 rounded-full bg-card-2 flex items-center justify-center text-xs font-semibold text-card-heading shrink-0 hover:opacity-80 transition-opacity"
        >
          {initials}
        </Link>
      ) : (
        <div className="w-9 h-9 rounded-full bg-card-2 flex items-center justify-center text-xs font-semibold text-card-heading shrink-0">
          {initials}
        </div>
      )}

      <div className="flex flex-col gap-1 flex-1">
        <div className="flex items-center gap-2">
          {comment.authorId ? (
            <Link
              to={`/authors/${comment.authorId}`}
              className="text-sm font-semibold text-card-heading hover:text-accent transition-colors"
            >
              {comment.authorName}
            </Link>
          ) : (
            <span className="text-sm font-semibold text-card-heading">{comment.authorName}</span>
          )}
          <span className="text-xs text-card-text-dim">
            {dayjs(comment.createdAt).fromNow()}
          </span>
        </div>
        <p className="text-sm text-card-text leading-relaxed">{comment.content}</p>
        <button
          onClick={() => (isControlled ? onToggleLike?.() : setLocalLiked((prev) => !prev))}
          aria-pressed={liked}
          className={`flex items-center gap-1 text-xs font-medium mt-1 w-fit transition-colors ${
            liked ? 'text-accent' : 'text-card-text-dim hover:text-accent'
          }`}
        >
          <ThumbsUp className="w-3.5 h-3.5" />
          {likeCount}
        </button>
      </div>
    </div>
  )
}
