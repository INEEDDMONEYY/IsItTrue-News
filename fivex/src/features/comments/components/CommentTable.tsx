import { MessageCircle } from 'lucide-react'
import { CommentTableRow } from './CommentTableRow'
import type { MyComment } from '../types/comment.types'

interface CommentTableProps {
  comments: MyComment[]
  view: 'my-comments' | 'on-my-posts'
}

export function CommentTable({
  comments,
  view,
}: CommentTableProps) {
  const emptyMessage =
    view === 'my-comments'
      ? 'You have not posted any comments yet.'
      : 'There are no comments from other users on your posts yet.'

  if (comments.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] px-6 py-14 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <MessageCircle className="h-6 w-6" />
        </div>

        <h3 className="mt-4 text-base font-semibold text-[var(--color-card-heading)]">
          No comments found
        </h3>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--color-card-text-muted)]">
          {emptyMessage}
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[var(--color-card-border)] bg-[var(--color-card-2)]">
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[var(--color-card-text-muted)]">
                Comment
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[var(--color-card-text-muted)]">
                Article
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[var(--color-card-text-muted)]">
                Engagement
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[var(--color-card-text-muted)]">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {comments.map((comment) => (
              <CommentTableRow
                key={comment.id}
                comment={comment}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}