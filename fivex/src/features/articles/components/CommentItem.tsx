import { useState } from 'react'
import { ThumbsUp } from 'lucide-react'
import dayjs from '@/lib/dayjs'
import type { ArticleComment } from '../types/articleDetail.types'

export function CommentItem({ comment }: { comment: ArticleComment }) {
  const [liked, setLiked] = useState(false)
  const likeCount = comment.likes + (liked ? 1 : 0)

  return (
    <div className="flex gap-3 py-4 border-b border-card-border last:border-b-0">
      <div className="w-9 h-9 rounded-full bg-card-2 flex items-center justify-center text-xs font-semibold text-card-heading shrink-0">
        {comment.authorName
          .split(' ')
          .map((part) => part[0])
          .join('')
          .slice(0, 2)}
      </div>

      <div className="flex flex-col gap-1 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-card-heading">{comment.authorName}</span>
          <span className="text-xs text-card-text-dim">
            {dayjs(comment.createdAt).fromNow()}
          </span>
        </div>
        <p className="text-sm text-card-text leading-relaxed">{comment.content}</p>
        <button
          onClick={() => setLiked((prev) => !prev)}
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
