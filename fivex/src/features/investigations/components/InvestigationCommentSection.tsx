import { useState } from 'react'
import { useAuth } from '@/app/providers/AuthProvider'
import { Spinner } from '@/components/ui/Spinner'
import { SignUpPromptModal } from '@/components/modals/SignUpPromptModal'
import type { InvestigationComment } from '../types/investigation.types'

interface InvestigationCommentSectionProps {
  comments: InvestigationComment[]
  onSubmit: (content: string) => Promise<void>
  isPosting: boolean
}

export function InvestigationCommentSection({
  comments,
  onSubmit,
  isPosting,
}: InvestigationCommentSectionProps) {
  const { isAuthenticated } = useAuth()
  const [draft, setDraft] = useState('')
  const [signUpPrompt, setSignUpPrompt] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const content = draft.trim()
    if (!content) return
    await onSubmit(content)
    setDraft('')
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-heading">
        Comments <span className="font-normal text-text-dim">({comments.length})</span>
      </h2>

      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Share your thoughts on this investigation..."
            rows={3}
            className="w-full resize-none rounded-xl border border-card-border bg-card px-4 py-3 text-sm text-card-text placeholder:text-card-text-dim focus:border-accent-border focus:outline-none"
          />
          <button
            type="submit"
            disabled={!draft.trim() || isPosting}
            className="self-end flex items-center gap-2 rounded-lg bg-brand-gradient px-4 py-2 text-sm font-medium text-on-brand transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPosting && <Spinner size="sm" className="border-white/40 border-t-white" />}
            {isPosting ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setSignUpPrompt(true)}
          className="self-start rounded-lg border border-card-border px-4 py-2 text-sm font-medium text-card-text transition hover:border-accent-border"
        >
          Sign up to join the discussion
        </button>
      )}

      <div className="rounded-2xl border border-card-border bg-card px-5">
        {comments.length === 0 && (
          <p className="py-6 text-center text-sm text-card-text-dim">No comments yet — be the first to respond.</p>
        )}
        {comments.map((comment) => (
          <div key={comment.id} className="border-b border-card-border py-4 last:border-0">
            <p className="text-sm font-semibold text-card-heading">
              {typeof comment.user === 'object' ? comment.user.name : 'Reader'}
            </p>
            <p className="mt-1 text-sm text-card-text">{comment.content}</p>
          </div>
        ))}
      </div>

      {signUpPrompt && (
        <SignUpPromptModal
          title="Sign up to join the discussion"
          description="Create a free account to comment on investigations."
          onClose={() => setSignUpPrompt(false)}
        />
      )}
    </div>
  )
}
