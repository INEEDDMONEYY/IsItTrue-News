
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileCheck2,
  MoreHorizontal,
  Pencil,
  Users,
} from 'lucide-react'

import type { AuthorArticle } from '../types/authorArticle.types'

import {
  getCoAuthorCount,
  getDraftProgress,
  getDraftStatusLabel,
  getVerifiedSourceCount,
  isReadyToSubmit,
} from '../utils/draft.utils'

interface DraftCardProps {
  draft: AuthorArticle
  onEdit: (draft: AuthorArticle) => void
  onPreview: (draft: AuthorArticle) => void
  onDelete: (draft: AuthorArticle) => void
}

export function DraftCard({
  draft,
  onEdit,
  onPreview,
  onDelete,
}: DraftCardProps) {
  const progress = getDraftProgress(draft)
  const coAuthorCount = getCoAuthorCount(draft)
  const verifiedSources = getVerifiedSourceCount(draft)
  const ready = isReadyToSubmit(draft)

  return (
    <article className="group overflow-hidden rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      {draft.featuredImage ? (
        <div className="aspect-[16/8] overflow-hidden bg-slate-100">
          <img
            src={draft.featuredImage}
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </div>
      ) : (
        <div className="flex aspect-[16/8] items-center justify-center bg-[var(--color-accent-bg)]">
          <FileCheck2 className="h-8 w-8 text-[var(--color-accent)]" />
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            {draft.category && (
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-accent)]">
                {draft.category}
              </p>
            )}

            <h2 className="mt-1 line-clamp-2 text-lg font-bold leading-snug text-[var(--color-card-heading)]">
              {draft.title || 'Untitled Draft'}
            </h2>
          </div>

          <div className="relative">
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-card-text-muted)] transition hover:bg-slate-100 hover:text-[var(--color-card-heading)]"
              aria-label="Draft actions"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>
        </div>

        {draft.excerpt && (
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--color-card-text-muted)]">
            {draft.excerpt}
          </p>
        )}

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-medium text-[var(--color-card-text-muted)]">
              Editorial progress
            </span>

            <span className="font-semibold text-[var(--color-card-heading)]">
              {progress}%
            </span>
          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-[var(--color-accent)] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
            {getDraftStatusLabel(draft.status)}
          </span>

          {draft.factCheckStatus === 'verified' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Fact Checked
            </span>
          )}

          {draft.factCheckStatus === 'needs-revision' && (
            <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
              Fact Check Revision
            </span>
          )}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 border-y border-[var(--color-card-border)] py-4">
          <div>
            <p className="text-xs text-[var(--color-card-text-muted)]">
              Sources
            </p>
            <p className="mt-1 text-sm font-semibold text-[var(--color-card-heading)]">
              {verifiedSources}/{draft.sources.length} verified
            </p>
          </div>

          <div>
            <p className="text-xs text-[var(--color-card-text-muted)]">
              Word Count
            </p>
            <p className="mt-1 text-sm font-semibold text-[var(--color-card-heading)]">
              {draft.wordCount.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {coAuthorCount > 0 && (
            <div className="flex items-center gap-2 text-xs text-[var(--color-card-text-muted)]">
              <Users className="h-4 w-4" />
              <span>
                {coAuthorCount}{' '}
                {coAuthorCount === 1 ? 'co-author' : 'co-authors'}
              </span>
            </div>
          )}

          {draft.assignment && (
            <div className="flex items-center gap-2 text-xs text-[var(--color-card-text-muted)]">
              <FileCheck2 className="h-4 w-4" />
              <span className="truncate">
                Assignment: {draft.assignment.title}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-[var(--color-card-text-muted)]">
            <Clock3 className="h-4 w-4" />
            <span>
              Last edited{' '}
              {new Date(draft.updatedAt).toLocaleDateString()}
            </span>
          </div>

          {draft.assignment?.dueDate && (
            <div className="flex items-center gap-2 text-xs text-[var(--color-card-text-muted)]">
              <CalendarDays className="h-4 w-4" />
              <span>
                Due{' '}
                {new Date(
                  draft.assignment.dueDate,
                ).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={() => onEdit(draft)}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-hover)]"
          >
            <Pencil className="h-4 w-4" />
            Continue Editing
          </button>

          <button
            type="button"
            onClick={() => onPreview(draft)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--color-card-border)] text-[var(--color-card-text-muted)] transition hover:bg-slate-50 hover:text-[var(--color-card-heading)]"
            aria-label="Preview draft"
          >
            <ExternalLink className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(draft)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--color-card-border)] text-[var(--color-card-text-muted)] transition hover:bg-red-50 hover:text-red-600"
            aria-label="Delete draft"
          >
            <span className="text-xs font-semibold">Del</span>
          </button>
        </div>

        {ready && (
          <div className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-center text-xs font-medium text-emerald-700">
            This draft is ready to submit.
          </div>
        )}
      </div>
    </article>
  )
}

