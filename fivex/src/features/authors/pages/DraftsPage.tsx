import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, FilePlus2, Loader2, Pencil, Send, Trash2 } from 'lucide-react'
import { PageLoader } from '@/components/loaders/PageLoader'
import { PaywallGate } from '@/features/billing/components/PaywallGate'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { ReviewFeedbackPanel } from '../components/ReviewFeedbackPanel'
import { hasReviewFeedback } from '../utils/reviewFeedback'
import { useMyDrafts } from '../hooks/useMyDrafts'
import type { MyArticle } from '../types/myArticle.types'

type DraftStage = 'draft' | 'changes_requested' | 'in_review' | 'published'
type StageFilter = DraftStage | 'all'

const STAGE_META: Record<DraftStage, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-card-2 text-card-text-muted border-card-border' },
  changes_requested: { label: 'Changes requested', className: 'bg-disputed/10 text-disputed border-disputed/30' },
  in_review: { label: 'In editor review', className: 'bg-pending/10 text-pending border-pending/30' },
  published: { label: 'Published', className: 'bg-verified/10 text-verified border-verified/30' },
}

const FILTERS: { value: StageFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'changes_requested', label: 'Changes requested' },
  { value: 'draft', label: 'Drafts' },
  { value: 'in_review', label: 'In review' },
  { value: 'published', label: 'Published' },
]

function getStage(article: MyArticle): DraftStage {
  if (article.status === 'published') return 'published'
  if (article.status === 'pending_review') return 'in_review'
  return hasReviewFeedback(article) ? 'changes_requested' : 'draft'
}

interface DraftCardProps {
  article: MyArticle
  onToggleRequirement: (articleId: string, requirementId: string, done: boolean) => void
  onSubmit: (articleId: string) => void
  onDelete: (article: MyArticle) => void
  isBusy: boolean
}

function DraftCard({ article, onToggleRequirement, onSubmit, onDelete, isBusy }: DraftCardProps) {
  const stage = getStage(article)
  const meta = STAGE_META[stage]
  const requirements = article.reviewRequirements ?? []
  const openRequirements = requirements.filter((requirement) => !requirement.done).length
  const isDraft = article.status === 'draft'
  const canResubmit = isDraft && openRequirements === 0 && article.body.trim().length > 0

  return (
    <article className="rounded-2xl border border-card-border bg-card p-4 sm:p-5 flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-card-text-muted">{article.category}</p>
          <h2 className="mt-0.5 text-base font-semibold text-card-heading break-words">{article.title}</h2>
          {article.excerpt && <p className="mt-1 text-sm text-card-text-muted line-clamp-2">{article.excerpt}</p>}
        </div>
        <span className={`self-start shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${meta.className}`}>
          {meta.label}
        </span>
      </div>

      <p className="text-xs text-card-text-muted">
        Updated {new Date(article.updatedAt).toLocaleDateString()}
        {article.submittedAt && stage !== 'draft' ? ` · Submitted ${new Date(article.submittedAt).toLocaleDateString()}` : ''}
      </p>

      {stage === 'changes_requested' && (
        <ReviewFeedbackPanel
          review={article}
          disabled={isBusy}
          onToggleRequirement={(requirementId, done) => onToggleRequirement(article.id, requirementId, done)}
        />
      )}

      {stage === 'in_review' && (
        <p className="rounded-lg bg-pending/10 px-3 py-2 text-sm text-card-text">
          An editor is reviewing this article. You&apos;ll be notified when they decide.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {isDraft && (
          <>
            <Link
              to={`/dashboard/articles/${article.id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-heading hover:border-accent-border hover:text-accent transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              {stage === 'changes_requested' ? 'Make changes' : 'Edit'}
            </Link>
            <button
              type="button"
              disabled={!canResubmit || isBusy}
              onClick={() => onSubmit(article.id)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-gradient px-3 py-2 text-xs font-medium text-on-brand transition-colors disabled:opacity-50"
            >
              {isBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              {stage === 'changes_requested' ? 'Resubmit for review' : 'Submit for review'}
            </button>
            {stage === 'changes_requested' && openRequirements > 0 && (
              <span className="text-xs text-card-text-muted">
                Tick off all {requirements.length} requirements to resubmit.
              </span>
            )}
          </>
        )}

        {stage === 'published' && (
          <Link
            to={`/article/${article.slug}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-heading hover:border-accent-border hover:text-accent transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            View
          </Link>
        )}

        {stage !== 'in_review' && stage !== 'published' && (
          <button
            type="button"
            disabled={isBusy}
            onClick={() => onDelete(article)}
            className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs text-disputed hover:bg-surface-2 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        )}
      </div>
    </article>
  )
}

export function DraftsPage() {
  const { articles, isLoading, isError, toggleRequirement, submitForReview, remove } = useMyDrafts()
  const [filter, setFilter] = useState<StageFilter>('all')

  const counts = articles.reduce<Record<DraftStage, number>>(
    (acc, article) => {
      acc[getStage(article)] += 1
      return acc
    },
    { draft: 0, changes_requested: 0, in_review: 0, published: 0 },
  )
  const visible = filter === 'all' ? articles : articles.filter((article) => getStage(article) === filter)

  const actionError = toggleRequirement.error ?? submitForReview.error ?? remove.error

  const handleDelete = (article: MyArticle) => {
    if (!window.confirm(`Delete "${article.title}"? This cannot be undone.`)) return
    remove.mutate(article.id)
  }

  return (
    <PaywallGate feature="drafts">
      <div>
        <div className="flex items-center justify-between gap-4 mb-1">
          <h1 className="text-2xl font-semibold text-heading">My Drafts</h1>
          <Link
            to="/dashboard/articles/new"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-gradient text-on-brand text-sm font-medium transition-colors"
          >
            <FilePlus2 className="w-4 h-4" />
            New Article
          </Link>
        </div>
        <p className="text-sm text-text-muted mb-5">
          Your articles, including any changes an editor needs before they can be published.
        </p>

        {counts.changes_requested > 0 && (
          <div className="mb-5 rounded-xl border border-disputed/30 bg-disputed/10 px-4 py-3 text-sm text-card-text">
            {counts.changes_requested} article{counts.changes_requested === 1 ? ' needs' : 's need'} changes before
            it can be published.
          </div>
        )}

        <div className="mb-5 flex flex-wrap gap-2">
          {FILTERS.map(({ value, label }) => {
            const count = value === 'all' ? articles.length : counts[value]
            const active = filter === value
            return (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                aria-pressed={active}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? 'border-transparent bg-brand-gradient text-on-brand'
                    : 'border-border text-text-muted hover:border-accent-border hover:text-accent'
                }`}
              >
                {label} ({count})
              </button>
            )
          })}
        </div>

        {actionError != null && <p className="mb-4 text-sm text-disputed">{getErrorMessage(actionError)}</p>}

        {isLoading ? (
          <PageLoader label="Loading your drafts..." />
        ) : isError ? (
          <p className="text-sm text-disputed">Couldn&apos;t load your articles. Please refresh and try again.</p>
        ) : visible.length === 0 ? (
          <div className="rounded-xl border border-card-border bg-card p-8 text-center text-sm text-card-text-muted">
            {articles.length === 0 ? 'You have no articles yet.' : 'Nothing here yet.'}
          </div>
        ) : (
          <div className="flex flex-col gap-4 max-w-3xl">
            {visible.map((article) => (
              <DraftCard
                key={article.id}
                article={article}
                isBusy={
                  (submitForReview.isPending && submitForReview.variables === article.id) ||
                  (remove.isPending && remove.variables === article.id) ||
                  toggleRequirement.isPending
                }
                onToggleRequirement={(id, requirementId, done) =>
                  toggleRequirement.mutate({ id, requirementId, done })
                }
                onSubmit={(id) => submitForReview.mutate(id)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </PaywallGate>
  )
}
