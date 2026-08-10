import {
  ExternalLink,
  Heart,
  ThumbsDown,
} from 'lucide-react'
import { CommentStatusBadge } from './CommentStatusBadge'
import type { MyComment } from '../types/comment.types'

interface CommentTableRowProps {
  comment: MyComment
}

function formatCommentDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

export function CommentTableRow({
  comment,
}: CommentTableRowProps) {
  return (
    <tr className="border-b border-[var(--color-card-border)] last:border-b-0">
      <td className="px-5 py-5 align-top">
        <div className="max-w-xl">
          <p className="text-sm leading-6 text-[var(--color-card-text)]">
            {comment.content}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[var(--color-card-text-muted)]">
            <span>
              {comment.isOwnComment ? 'You' : comment.authorName}
            </span>

            {comment.authorRole && (
              <>
                <span>•</span>
                <span>{comment.authorRole}</span>
              </>
            )}

            <span>•</span>

            <span>{formatCommentDate(comment.createdAt)}</span>
          </div>
        </div>
      </td>

      <td className="px-5 py-5 align-top">
        <div className="min-w-[220px]">
          <p className="text-sm font-semibold text-[var(--color-card-heading)]">
            {comment.articleTitle}
          </p>

          <button
            type="button"
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-blue-600 transition-colors hover:text-blue-700"
          >
            View article
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>

      <td className="px-5 py-5 align-top">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600">
            <Heart className="h-4 w-4" />
            {comment.likes}
          </span>

          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-red-500">
            <ThumbsDown className="h-4 w-4" />
            {comment.dislikes}
          </span>
        </div>
      </td>

      <td className="px-5 py-5 align-top">
        <CommentStatusBadge status={comment.status} />
      </td>
    </tr>
  )
}