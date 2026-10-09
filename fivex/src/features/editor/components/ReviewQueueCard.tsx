import { useState } from 'react'
import { Check, ChevronDown, ListPlus, Loader2, MessageSquareWarning, Trash2 } from 'lucide-react'
import DOMPurify from 'dompurify'
import { ReviewFeedbackPanel } from '@/features/authors/components/ReviewFeedbackPanel'
import { hasReviewFeedback } from '@/features/authors/utils/reviewFeedback'
import { getErrorMessage } from '@/lib/getErrorMessage'
import type { PendingArticle } from '../types/reviewQueue.types'

interface ReviewQueueCardProps {
  article: PendingArticle
  onApprove: (id: string) => Promise<void>
  onRequestChanges: (id: string, requirements: string[], note: string) => Promise<void>
}

export function ReviewQueueCard({ article, onApprove, onRequestChanges }: ReviewQueueCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [requestingChanges, setRequestingChanges] = useState(false)
  const [requirements, setRequirements] = useState<string[]>([''])
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submittedOn = new Date(article.submittedAt ?? article.createdAt).toLocaleDateString()
  const cleanedRequirements = requirements.map((text) => text.trim()).filter(Boolean)
  const canSend = cleanedRequirements.length > 0 || note.trim().length > 0

  const run = async (action: () => Promise<void>, fallback: string) => {
    setBusy(true)
    setError(null)
    try {
      await action()
    } catch (err) {
      setError(getErrorMessage(err, fallback))
      setBusy(false)
    }
  }

  const updateRequirement = (index: number, value: string) =>
    setRequirements((current) => current.map((text, i) => (i === index ? value : text)))

  const removeRequirement = (index: number) =>
    setRequirements((current) => (current.length === 1 ? [''] : current.filter((_, i) => i !== index)))

  return (
    <article className="rounded-xl border border-card-border bg-card p-4 flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-card-heading break-words">{article.title}</h2>
          <p className="mt-1 text-xs text-card-text-muted">
            {article.author?.name ?? 'Unknown author'} · {article.category} · Submitted {submittedOn}
          </p>
          {article.excerpt && <p className="mt-2 text-sm text-card-text">{article.excerpt}</p>}
        </div>

        {!requestingChanges && (
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              disabled={busy}
              onClick={() => run(() => onApprove(article.id), 'Failed to approve the article.')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-verified/10 text-verified border border-verified/30 hover:bg-verified/20 transition-colors disabled:opacity-50"
            >
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              Approve
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setRequestingChanges(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-pending/10 text-pending border border-pending/30 hover:bg-pending/20 transition-colors disabled:opacity-50"
            >
              <MessageSquareWarning className="w-3.5 h-3.5" />
              Request changes
            </button>
          </div>
        )}
      </div>

      {hasReviewFeedback(article) && !requestingChanges && (
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium text-card-text-muted">Your earlier feedback — the author has resubmitted</p>
          <ReviewFeedbackPanel review={article} />
        </div>
      )}

      {requestingChanges && (
        <div className="flex flex-col gap-3 rounded-lg border border-card-border p-3">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-card-heading">
              Requirements — what must change before this can be published?
            </p>
            {requirements.map((text, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  value={text}
                  onChange={(event) => updateRequirement(index, event.target.value)}
                  maxLength={300}
                  placeholder={`Requirement ${index + 1}, e.g. Add a second source for the statistics`}
                  aria-label={`Requirement ${index + 1}`}
                  className="min-w-0 flex-1 px-3 py-2 rounded-lg border border-border bg-bg text-sm text-heading placeholder:text-text-dim focus:outline-none focus:ring-2 focus:ring-accent-border"
                />
                <button
                  type="button"
                  onClick={() => removeRequirement(index)}
                  aria-label={`Remove requirement ${index + 1}`}
                  className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg text-card-text-muted hover:text-disputed hover:bg-surface-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              disabled={requirements.length >= 20}
              onClick={() => setRequirements((current) => [...current, ''])}
              className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-accent hover:underline disabled:opacity-50"
            >
              <ListPlus className="w-3.5 h-3.5" />
              Add requirement
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-card-heading" htmlFor={`note-${article.id}`}>
              Note to the author <span className="font-normal text-card-text-muted">(optional)</span>
            </label>
            <textarea
              id={`note-${article.id}`}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={3}
              maxLength={500}
              className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm text-heading focus:outline-none focus:ring-2 focus:ring-accent-border resize-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={busy || !canSend}
              onClick={() =>
                run(
                  () => onRequestChanges(article.id, cleanedRequirements, note.trim()),
                  'Failed to send the article back.',
                )
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-brand-gradient text-on-brand transition-colors disabled:opacity-50"
            >
              {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Send back to author
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setRequestingChanges(false)}
              className="px-3 py-1.5 rounded-lg text-xs text-card-text-muted hover:bg-surface-2 transition-colors"
            >
              Cancel
            </button>
            {!canSend && <span className="text-xs text-card-text-muted">Add a requirement or a note.</span>}
          </div>
        </div>
      )}

      {error && <p className="text-xs text-disputed">{error}</p>}

      <button
        type="button"
        onClick={() => setExpanded((open) => !open)}
        aria-expanded={expanded}
        className="inline-flex w-fit items-center gap-1 text-xs font-medium text-accent hover:underline"
      >
        {expanded ? 'Hide article' : 'Read article'}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {expanded && (
        <div className="flex flex-col gap-3 border-t border-card-border pt-3">
          {article.articleImageUrl && (
            <img src={article.articleImageUrl} alt="" className="w-full max-h-64 rounded-lg object-cover" />
          )}
          <div
            className="text-sm text-card-text leading-relaxed break-words space-y-3 [&_img]:max-w-full [&_img]:rounded-lg [&_h2]:text-base [&_h2]:font-semibold [&_h3]:font-semibold [&_a]:text-accent [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.body) }}
          />
          {article.sourceLinks && article.sourceLinks.length > 0 && (
            <div className="text-xs text-card-text-muted">
              <p className="font-medium text-card-heading mb-1">Sources</p>
              <ul className="space-y-1">
                {article.sourceLinks.map((link) => (
                  <li key={link} className="break-all">
                    <a href={link} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </article>
  )
}
