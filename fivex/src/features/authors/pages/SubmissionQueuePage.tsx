
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FileText,
  Send,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { apiClient } from '@/api/client'
import { PageLoader } from '@/components/loaders/PageLoader'
import { Spinner } from '@/components/ui/Spinner'
import { articlesApi } from '@/features/authors/api/articles.api'

// The real shape returned by GET /api/articles/mine (see
// backend/modules/articles/models/Article.ts's toJSON transform) — kept
// local to this page since the shared `AuthorArticle` type describes a
// richer mock workflow (editors, revisions, collaborators) that the
// backend doesn't actually support yet.
interface SubmissionArticle {
  id: string
  title: string
  slug: string
  excerpt: string
  category: string
  status: 'draft' | 'pending_review' | 'published'
  factCheckStatus: 'none' | 'pending' | 'approved' | 'rejected'
  factCheckRejectionReason?: string
  createdAt: string
  updatedAt: string
  publishedAt?: string
}

const STATUS_LABELS: Record<SubmissionArticle['status'], string> = {
  draft: 'Draft',
  pending_review: 'In editor review',
  published: 'Published',
}

const STATUS_STYLES: Record<SubmissionArticle['status'], string> = {
  draft: 'bg-slate-100 text-slate-600',
  pending_review: 'bg-amber-50 text-amber-700',
  published: 'bg-emerald-50 text-emerald-700',
}

function SubmissionCard({
  article,
  onSubmit,
  isSubmitting,
}: {
  article: SubmissionArticle
  onSubmit: (id: string) => void
  isSubmitting: boolean
}) {
  const isDraft = article.status === 'draft'
  const isPublished = article.status === 'published'
  const needsFactCheckAttention = article.factCheckStatus === 'rejected'

  return (
    <article className="rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent-bg)] text-[var(--color-accent)]">
            <FileText className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <span
              className={`mb-2 inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[article.status]}`}
            >
              {STATUS_LABELS[article.status]}
            </span>

            <h2 className="text-lg font-bold text-[var(--color-card-heading)]">
              {article.title}
            </h2>

            <p className="mt-1 text-sm text-[var(--color-card-text-muted)]">
              {article.category}
            </p>
          </div>
        </div>

        <div className="shrink-0 text-left sm:text-right">
          <p className="text-xs text-[var(--color-text-muted)]">
            {isDraft ? 'Last updated' : 'Submitted'}
          </p>

          <p className="mt-1 text-sm font-semibold text-[var(--color-card-heading)]">
            {new Date(article.updatedAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {needsFactCheckAttention && article.factCheckRejectionReason && (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-800">
            Fact-check issues found
          </p>

          <p className="mt-1 text-sm leading-6 text-amber-700">
            {article.factCheckRejectionReason}
          </p>
        </div>
      )}

      <div className="mt-5 grid gap-3 border-t border-[var(--color-card-border)] pt-5 sm:grid-cols-2">
        <InfoItem
          icon={FileCheck2}
          label="Fact check"
          value={
            article.factCheckStatus === 'approved'
              ? 'Verified'
              : article.factCheckStatus === 'pending'
                ? 'In progress'
                : article.factCheckStatus === 'rejected'
                  ? 'Issues found'
                  : 'Not submitted'
          }
        />

        <InfoItem
          icon={Clock3}
          label="Status"
          value={STATUS_LABELS[article.status]}
        />
      </div>

      <div className="mt-6 flex justify-end gap-2">
        {isDraft && (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => onSubmit(article.id)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-on-brand transition disabled:opacity-60"
          >
            {isSubmitting ? <Spinner size="sm" className="border-white/40 border-t-white" /> : <Send className="h-4 w-4" />}
            Submit for Review
          </button>
        )}

        {isPublished && (
          <Link
            to={`/article/${article.slug}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--color-card-border)] px-4 py-2.5 text-sm font-semibold text-[var(--color-card-heading)] transition hover:bg-slate-50"
          >
            View Article
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
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
  const queryClient = useQueryClient()

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['authors', 'articles', 'mine'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ articles: SubmissionArticle[] }>(
        '/api/articles/mine',
      )
      return data.articles
    },
  })

  const submitMutation = useMutation({
    mutationFn: (id: string) => articlesApi.updateStatus(id, 'pending_review'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['authors', 'articles', 'mine'] }),
  })

  const submissions = articles.filter((article) => article.status !== 'draft')

  const counts = {
    drafts: articles.filter((article) => article.status === 'draft').length,
    pendingReview: articles.filter((article) => article.status === 'pending_review').length,
    published: articles.filter((article) => article.status === 'published').length,
    factCheckIssues: articles.filter((article) => article.factCheckStatus === 'rejected').length,
  }

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
          and publishing decisions.
        </p>
      </header>

      <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={FileText}
          label="Drafts"
          value={counts.drafts}
          description="Articles not yet submitted"
        />

        <SummaryCard
          icon={Clock3}
          label="In review"
          value={counts.pendingReview}
          description="Currently with editors"
        />

        <SummaryCard
          icon={CheckCircle2}
          label="Published"
          value={counts.published}
          description="Live on the site"
        />

        <SummaryCard
          icon={FileCheck2}
          label="Fact-check issues"
          value={counts.factCheckIssues}
          description="Need author attention"
        />
      </section>

      {isLoading ? (
        <PageLoader label="Loading submissions..." />
      ) : submissions.length === 0 ? (
        <div className="rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] px-6 py-14 text-center shadow-sm">
          <p className="text-sm text-[var(--color-card-text-muted)]">
            No submitted articles yet. Submit a draft from your Articles list to see it here.
          </p>
        </div>
      ) : (
        <section className="space-y-5">
          {submissions.map((article) => (
            <SubmissionCard
              key={article.id}
              article={article}
              onSubmit={(id) => submitMutation.mutate(id)}
              isSubmitting={submitMutation.isPending && submitMutation.variables === article.id}
            />
          ))}
        </section>
      )}
    </main>
  )
}

