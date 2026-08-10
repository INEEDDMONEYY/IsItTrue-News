
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  MessageSquare,
  RefreshCw,
  Search,
  Send,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import {
  useSubmissionQueue,
  type SubmissionQueueStatus,
} from '@/features/authors/hooks/useSubmissionQueue'

const statusConfig: Record<
  SubmissionQueueStatus,
  {
    label: string
    className: string
    icon: typeof Clock3
  }
> = {
  submitted: {
    label: 'Submitted',
    className:
      'bg-slate-100 text-slate-700 border-slate-200',
    icon: Send,
  },
  under_review: {
    label: 'Under Review',
    className:
      'bg-blue-50 text-blue-700 border-blue-200',
    icon: Clock3,
  },
  revision_requested: {
    label: 'Revision Requested',
    className:
      'bg-amber-50 text-amber-700 border-amber-200',
    icon: RefreshCw,
  },
  approved: {
    label: 'Approved',
    className:
      'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCircle2,
  },
  published: {
    label: 'Published',
    className:
      'bg-violet-50 text-violet-700 border-violet-200',
    icon: CheckCircle2,
  },
  rejected: {
    label: 'Rejected',
    className:
      'bg-red-50 text-red-700 border-red-200',
    icon: FileText,
  },
}

const formatDate = (date: string) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

export function SubmittedArticlesPage() {
  const {
    submissions,
    stats,
    statusFilter,
    setStatusFilter,
    search,
    setSearch,
    sortBy,
    setSortBy,
    clearFilters,
  } = useSubmissionQueue()

  const hasActiveFilters =
    statusFilter !== 'all' || search.trim().length > 0

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--color-card-border)] bg-[var(--color-card)] px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--color-accent)]">
              <Send className="h-3.5 w-3.5" />
              Author Workspace
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-[var(--color-heading)] sm:text-4xl">
              Submission Queue
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">
              Track your submitted work, monitor editorial review,
              respond to revision requests, and follow each story
              through publication.
            </p>
          </div>

          <Link
            to="/dashboard/authors/articles/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-hover)]"
          >
            <FileText className="h-4 w-4" />
            New Article
          </Link>
        </div>
      </header>

      {/* Stats */}
      <section className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-accent-bg)] text-[var(--color-accent)]">
              <Send className="h-5 w-5" />
            </div>

            <span className="text-xs font-medium text-[var(--color-text-muted)]">
              Total
            </span>
          </div>

          <p className="mt-4 text-2xl font-bold text-[var(--color-card-heading)]">
            {stats.total}
          </p>

          <p className="mt-1 text-sm text-[var(--color-card-text-muted)]">
            Submissions
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Clock3 className="h-5 w-5" />
            </div>

            <span className="text-xs font-medium text-[var(--color-text-muted)]">
              Active
            </span>
          </div>

          <p className="mt-4 text-2xl font-bold text-[var(--color-card-heading)]">
            {stats.submitted + stats.underReview}
          </p>

          <p className="mt-1 text-sm text-[var(--color-card-text-muted)]">
            In editorial review
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <RefreshCw className="h-5 w-5" />
            </div>

            <span className="text-xs font-medium text-[var(--color-text-muted)]">
              Action
            </span>
          </div>

          <p className="mt-4 text-2xl font-bold text-[var(--color-card-heading)]">
            {stats.revisionsRequested}
          </p>

          <p className="mt-1 text-sm text-[var(--color-card-text-muted)]">
            Need revisions
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>

            <span className="text-xs font-medium text-[var(--color-text-muted)]">
              Complete
            </span>
          </div>

          <p className="mt-4 text-2xl font-bold text-[var(--color-card-heading)]">
            {stats.approved + stats.published}
          </p>

          <p className="mt-1 text-sm text-[var(--color-card-text-muted)]">
            Approved or published
          </p>
        </div>
      </section>

      {/* Toolbar */}
      <section className="mb-6 rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search submissions..."
              className="h-11 w-full rounded-xl border border-[var(--color-card-border)] bg-[var(--color-background)] pl-10 pr-4 text-sm text-[var(--color-heading)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/10"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as
                    | SubmissionQueueStatus
                    | 'all',
                )
              }
              className="h-11 rounded-xl border border-[var(--color-card-border)] bg-[var(--color-background)] px-3 text-sm font-medium text-[var(--color-heading)] outline-none focus:border-[var(--color-accent)]"
            >
              <option value="all">All statuses</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="revision_requested">
                Revision Requested
              </option>
              <option value="approved">Approved</option>
              <option value="published">Published</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={sortBy}
              onChange={(event) =>
                setSortBy(
                  event.target.value as
                    | 'updated'
                    | 'submitted'
                    | 'title',
                )
              }
              className="h-11 rounded-xl border border-[var(--color-card-border)] bg-[var(--color-background)] px-3 text-sm font-medium text-[var(--color-heading)] outline-none focus:border-[var(--color-accent)]"
            >
              <option value="updated">Recently updated</option>
              <option value="submitted">Recently submitted</option>
              <option value="title">Title</option>
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="h-11 rounded-xl border border-[var(--color-card-border)] px-4 text-sm font-semibold text-[var(--color-text-muted)] transition hover:bg-[var(--color-background)] hover:text-[var(--color-heading)]"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Results */}
      {submissions.length > 0 ? (
        <section className="space-y-4">
          {submissions.map((submission) => {
            const config = statusConfig[submission.status]
            const StatusIcon = config.icon

            return (
              <article
                key={submission.id}
                className="rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${config.className}`}
                      >
                        <StatusIcon className="h-3.5 w-3.5" />
                        {config.label}
                      </span>

                      {submission.priority === 'high' && (
                        <span className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                          High priority
                        </span>
                      )}

                      {submission.category && (
                        <span className="rounded-full border border-[var(--color-card-border)] px-2.5 py-1 text-xs font-medium text-[var(--color-text-muted)]">
                          {submission.category}
                        </span>
                      )}
                    </div>

                    <h2 className="mt-3 text-xl font-bold text-[var(--color-card-heading)]">
                      {submission.title}
                    </h2>

                    {submission.excerpt && (
                      <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--color-card-text-muted)]">
                        {submission.excerpt}
                      </p>
                    )}

                    <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[var(--color-text-muted)]">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5" />
                        Submitted {formatDate(submission.submittedAt)}
                      </span>

                      {submission.wordCount && (
                        <span>
                          {submission.wordCount.toLocaleString()}{' '}
                          words
                        </span>
                      )}

                      <span>
                        {submission.revisionCount ?? 0}{' '}
                        {submission.revisionCount === 1
                          ? 'revision'
                          : 'revisions'}
                      </span>
                    </div>
                  </div>

                  <Link
                    to={`/dashboard/authors/articles/${submission.id}`}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[var(--color-card-border)] px-4 py-2.5 text-sm font-semibold text-[var(--color-heading)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                  >
                    View submission
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="mt-6 grid gap-4 border-t border-[var(--color-card-border)] pt-5 md:grid-cols-2">
                  {/* Editor */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-accent-bg)] text-[var(--color-accent)]">
                      <Users className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-xs font-medium text-[var(--color-text-muted)]">
                        Assigned editor
                      </p>

                      <p className="mt-0.5 text-sm font-semibold text-[var(--color-card-heading)]">
                        {submission.assignedEditor?.name ??
                          'Awaiting assignment'}
                      </p>
                    </div>
                  </div>

                  {/* Collaborators */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                      <Users className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-xs font-medium text-[var(--color-text-muted)]">
                        Collaborators
                      </p>

                      <p className="mt-0.5 text-sm font-semibold text-[var(--color-card-heading)]">
                        {submission.collaborators?.length
                          ? `${submission.collaborators.length} ${
                              submission.collaborators.length === 1
                                ? 'collaborator'
                                : 'collaborators'
                            }`
                          : 'Solo submission'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Revision notice */}
                {submission.status === 'revision_requested' && (
                  <div className="mt-5 flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />

                      <div>
                        <p className="text-sm font-semibold text-amber-900">
                          Editorial revisions requested
                        </p>

                        <p className="mt-1 text-xs leading-5 text-amber-800">
                          Review the editor's feedback and update
                          your article before resubmitting.
                        </p>
                      </div>
                    </div>

                    <Link
                      to={`/dashboard/authors/articles/${submission.id}`}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-amber-700"
                    >
                      Review feedback
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                )}
              </article>
            )
          })}
        </section>
      ) : (
        <section className="rounded-2xl border border-dashed border-[var(--color-card-border)] bg-[var(--color-card)] px-6 py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-accent-bg)] text-[var(--color-accent)]">
            <Send className="h-7 w-7" />
          </div>

          <h2 className="mt-5 text-lg font-bold text-[var(--color-card-heading)]">
            No submissions found
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--color-card-text-muted)]">
            {hasActiveFilters
              ? 'Try changing your search or filters to find another submission.'
              : 'Once you submit an article, you will be able to track its editorial progress here.'}
          </p>

          {hasActiveFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-6 rounded-xl border border-[var(--color-card-border)] px-4 py-2.5 text-sm font-semibold text-[var(--color-heading)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            >
              Clear filters
            </button>
          ) : (
            <Link
              to="/dashboard/authors/articles/new"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-hover)]"
            >
              Start an article
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </section>
      )}
    </main>
  )
}

