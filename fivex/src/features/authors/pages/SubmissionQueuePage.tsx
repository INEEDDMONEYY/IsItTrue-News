
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FileText,
  RotateCcw,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { mockSubmissions } from '@/features/authors/data/mockSubmissions'
import { SubmissionStatusBadge } from '@/features/authors/components/SubmissionStatusBadge'
import type {
  ArticleSubmission,
  SubmissionStatus,
} from '@/features/authors/types/submission.types'

function SubmissionCard({
  submission,
}: {
  submission: ArticleSubmission
}) {
  const canSubmit = submission.status === 'ready'
  const needsRevision = submission.status === 'revision-requested'

  return (
    <article className="rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent-bg)] text-[var(--color-accent)]">
            <FileText className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <div className="mb-2">
              <SubmissionStatusBadge status={submission.status} />
            </div>

            <h2 className="text-lg font-bold text-[var(--color-card-heading)]">
              {submission.article.title}
            </h2>

            <p className="mt-1 text-sm text-[var(--color-card-text-muted)]">
              {submission.article.category}
            </p>
          </div>
        </div>

        {submission.submittedAt && (
          <div className="shrink-0 text-left sm:text-right">
            <p className="text-xs text-[var(--color-text-muted)]">
              Submitted
            </p>

            <p className="mt-1 text-sm font-semibold text-[var(--color-card-heading)]">
              {new Date(submission.submittedAt).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>

      {submission.editorialNote && (
        <div className="mt-5 rounded-xl bg-slate-50 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Editorial update
          </p>

          <p className="mt-1 text-sm leading-6 text-slate-700">
            {submission.editorialNote}
          </p>
        </div>
      )}

      <div className="mt-5 grid gap-3 border-t border-[var(--color-card-border)] pt-5 sm:grid-cols-3">
        <InfoItem
          icon={FileCheck2}
          label="Fact check"
          value={
            submission.article.factCheck.status === 'verified'
              ? 'Verified'
              : 'In progress'
          }
        />

        <InfoItem
          icon={Clock3}
          label="Workflow"
          value={submission.article.workflow.nextAction}
        />

        <InfoItem
          icon={CheckCircle2}
          label="Readiness"
          value={
            submission.article.submission.ready
              ? 'Submission ready'
              : 'Work required'
          }
        />
      </div>

      {needsRevision && submission.article.revisions.latestRequest && (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <RotateCcw className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />

            <div>
              <p className="text-sm font-semibold text-amber-800">
                Revisions requested
              </p>

              <p className="mt-1 text-sm leading-6 text-amber-700">
                {submission.article.revisions.latestRequest.summary}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {submission.assignedEditor ? (
            <p className="text-xs text-[var(--color-text-muted)]">
              Editor:{' '}
              <span className="font-semibold text-[var(--color-card-heading)]">
                {submission.assignedEditor.name}
              </span>
            </p>
          ) : (
            <p className="text-xs text-[var(--color-text-muted)]">
              No editor assigned yet
            </p>
          )}
        </div>

        <div className="flex gap-2">
          {canSubmit && (
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-hover)]"
            >
              Submit Article
              <ArrowRight className="h-4 w-4" />
            </button>
          )}

          {needsRevision && (
            <Link
              to={`/dashboard/authors/articles/${submission.articleId}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-hover)]"
            >
              Address Revisions
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}

          {!canSubmit && !needsRevision && (
            <Link
              to={`/dashboard/authors/articles/${submission.articleId}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--color-card-border)] px-4 py-2.5 text-sm font-semibold text-[var(--color-card-heading)] transition hover:bg-slate-50"
            >
              View Article
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof FileCheck2
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border border-[var(--color-card-border)] bg-slate-50 p-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-[var(--color-accent)]" />

        <span className="text-xs font-medium text-[var(--color-text-muted)]">
          {label}
        </span>
      </div>

      <p className="mt-1 text-sm font-semibold text-[var(--color-card-heading)]">
        {value}
      </p>
    </div>
  )
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: typeof FileCheck2
  label: string
  value: number
  description: string
}) {
  return (
    <div className="rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-accent-bg)] text-[var(--color-accent)]">
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
            {label}
          </p>

          <p className="mt-1 text-2xl font-bold text-[var(--color-heading)]">
            {value}
          </p>
        </div>
      </div>

      <p className="mt-3 text-xs text-[var(--color-text-muted)]">
        {description}
      </p>
    </div>
  )
}

export function SubmissionQueuePage() {
  const counts: Record<SubmissionStatus, number> = {
    ready: 0,
    submitted: 0,
    'editor-review': 0,
    'revision-requested': 0,
    approved: 0,
    rejected: 0,
    published: 0,
  }

  mockSubmissions.forEach((submission) => {
    counts[submission.status] += 1
  })

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="text-sm font-semibold text-[var(--color-accent)]">
          Author Workspace
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--color-heading)] sm:text-4xl">
          Submission Queue
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">
          Track articles prepared for submission, editorial reviews,
          requested revisions, and publishing decisions.
        </p>
      </header>

      <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={FileCheck2}
          label="Ready"
          value={counts.ready}
          description="Articles ready to submit"
        />

        <SummaryCard
          icon={Clock3}
          label="In review"
          value={counts['editor-review']}
          description="Currently with editors"
        />

        <SummaryCard
          icon={RotateCcw}
          label="Revisions"
          value={counts['revision-requested']}
          description="Need author attention"
        />

        <SummaryCard
          icon={CheckCircle2}
          label="Approved"
          value={counts.approved}
          description="Approved by editorial"
        />
      </section>

      <section className="space-y-5">
        {mockSubmissions.map((submission) => (
          <SubmissionCard
            key={submission.id}
            submission={submission}
          />
        ))}
      </section>
    </main>
  )
}

