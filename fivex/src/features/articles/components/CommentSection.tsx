import { forwardRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/app/providers/AuthProvider'
import { CommentItem } from './CommentItem'
import type { ArticleComment } from '../types/articleDetail.types'

interface CommentSectionProps {
  comments: ArticleComment[]
}

export const CommentSection = forwardRef<HTMLDivElement, CommentSectionProps>(
  function CommentSection({ comments: initialComments }, ref) {
    const { isAuthenticated, user } = useAuth()
    const [comments, setComments] = useState(initialComments)
    const [draft, setDraft] = useState('')

    function handleSubmit(event: React.FormEvent) {
      event.preventDefault()
      const content = draft.trim()
      if (!content || !user) return

      setComments((prev) => [
        {
          id: `local-${Date.now()}`,
          authorName: user.name,
          content,
          createdAt: new Date().toISOString(),
          likes: 0,
        },
        ...prev,
      ])
      setDraft('')
    }

    return (
      <div ref={ref} className="flex flex-col gap-4 scroll-mt-24">
        <h3 className="text-lg font-semibold text-heading">
          Comments <span className="text-text-dim font-normal">({comments.length})</span>
        </h3>

        {isAuthenticated ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Share your thoughts..."
              rows={3}
              className="w-full rounded-xl border border-card-border bg-card px-4 py-3 text-sm text-card-text placeholder:text-card-text-dim focus:outline-none focus:border-accent-border resize-none"
            />
            <button
              type="submit"
              disabled={!draft.trim()}
              className="self-end text-sm font-medium px-4 py-2 rounded-lg bg-accent text-white disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            >
              Post Comment
            </button>
          </form>
        ) : (
          <div className="rounded-xl border border-card-border bg-card px-4 py-3 text-sm text-card-text-muted">
            <Link to="/login" className="text-accent font-medium hover:underline">
              Sign in
            </Link>{' '}
            to join the conversation.
          </div>
        )}

        <div className="rounded-2xl border border-card-border bg-card px-5">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      </div>
    )
  },
)
