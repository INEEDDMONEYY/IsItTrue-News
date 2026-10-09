import { forwardRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/app/providers/AuthProvider'
import { Spinner } from '@/components/ui/Spinner'
import { useArticleComments } from '@/features/comments/hooks/useArticleComments'
import { CommentItem } from './CommentItem'
import type { ArticleComment } from '../types/articleDetail.types'

interface CommentSectionProps {
  comments: ArticleComment[]
  /** Present only for real, backend-sourced articles. */
  articleId?: string
}

export const CommentSection = forwardRef<HTMLDivElement, CommentSectionProps>(
  function CommentSection({ comments: initialComments, articleId }, ref) {
    const { isAuthenticated, user } = useAuth()
    const isReal = Boolean(articleId)

    const [mockComments, setMockComments] = useState(initialComments)
    const [draft, setDraft] = useState('')

    const {
      comments: realComments,
      likedCommentIds,
      isLoading: isLoadingComments,
      postComment,
      isPosting,
      toggleCommentLike,
    } = useArticleComments(articleId)

    const comments: ArticleComment[] = isReal
      ? realComments.map((comment) => ({
          id: comment.id,
          authorId: typeof comment.author === 'object' ? comment.author.id : undefined,
          authorName:
            typeof comment.author === 'object' ? comment.author.name : 'Reader',
          content: comment.content,
          createdAt: comment.createdAt,
          likes: comment.likes,
          liked: likedCommentIds.includes(comment.id),
        }))
      : mockComments

    async function handleSubmit(event: React.FormEvent) {
      event.preventDefault()
      const content = draft.trim()
      if (!content || !user) return

      if (isReal) {
        await postComment(content)
      } else {
        setMockComments((prev) => [
          {
            id: `local-${Date.now()}`,
            authorName: user.name,
            content,
            createdAt: new Date().toISOString(),
            likes: 0,
          },
          ...prev,
        ])
      }
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
              disabled={!draft.trim() || isPosting}
              className="self-end flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg bg-brand-gradient text-on-brand disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            >
              {isPosting && <Spinner size="sm" className="border-white/40 border-t-white" />}
              {isPosting ? 'Posting...' : 'Post Comment'}
            </button>
          </form>
        ) : null}

        {isReal && isLoadingComments ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : isAuthenticated ? (
          <div className="rounded-2xl border border-card-border bg-card px-5">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onToggleLike={
                  isReal && isAuthenticated ? () => toggleCommentLike(comment.id) : undefined
                }
              />
            ))}
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-2xl border border-card-border bg-card px-5">
            <div className="pointer-events-none select-none blur-sm" aria-hidden="true">
              {comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </div>

            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-card/70 px-4 text-center">
              <p className="text-sm font-semibold text-card-heading">
                Sign up to join the discussion
              </p>
              <Link
                to="/register"
                className="rounded-lg bg-brand-gradient px-4 py-2 text-sm font-semibold text-on-brand transition hover:opacity-90"
              >
                Sign up
              </Link>
            </div>
          </div>
        )}
      </div>
    )
  },
)
