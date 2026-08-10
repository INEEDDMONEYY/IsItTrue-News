
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  FlaskConical,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { mockAuthorArticles } from '@/features/authors/data/mockAuthorArticles'
import type {
  AuthorArticle,
  AuthorWorkflowStage,
} from '@/features/authors/types/authorArticle.types'

const workflowLabels: Record<AuthorWorkflowStage, string> = {
  draft: 'Draft',
  assignment: 'Assignment',
  collaboration: 'Collaboration',
  revision: 'Revision',
  'fact-check': 'Fact Check',
  'editor-review': 'Editor Review',
  approved: 'Approved',
  published: 'Published',
}

function getWorkflowBadgeClass(stage: AuthorWorkflowStage) {
  switch (stage) {
    case 'fact-check':
      return 'bg-amber-50 text-amber-700 ring-amber-200'
    case 'revision':
      return 'bg-orange-50 text-orange-700 ring-orange-200'
    case 'editor-review':
      return 'bg-blue-50 text-blue-700 ring-blue-200'
    case 'collaboration':
      return 'bg-violet-50 text-violet-700 ring-violet-200'
    case 'approved':
    case 'published':
      return 'bg-emerald-50 text-emerald-700 ring-emerald-200'
    default:
      return 'bg-slate-50 text-slate-700 ring-slate-200'
  }
}

function getFactCheckLabel(article: AuthorArticle) {
  switch (article.factCheck.status) {
    case 'verified':
      return 'Verified'
    case 'in-review':
      return 'In review'
    case 'issues-found':
      return `${article.factCheck.issuesFound} issues`
    case 'pending':
      return 'Pending'
    default:
      return 'Not submitted'
  }
}

function getFactCheckClass(article: AuthorArticle) {
  switch (article.factCheck.status) {
    case 'verified':
      return 'text-emerald-600'
    case 'issues-found':
      return 'text-red-600'
    case 'in-review':
    case 'pending':
      return 'text-amber-600'
    default:
      return 'text-slate-500'
  }
}

function getAssignmentSummary(article: AuthorArticle) {
  const assignments = article.collaboration.assignments

  if (!assignments.length) {
    return 'No active assignments'
  }

  const active = assignments.filter(
    (assignment) =>
      assignment.status === 'pending' ||
      assignment.status === 'in-progress',
  ).length

  if (!active) {
    return 'All assignments complete'
  }

  return `${active} active assignment${active === 1 ? '' : 's'}`
}

function DraftCard({ article }: { article: AuthorArticle }) {
  const hasOpenRevision =
    article.revisions.requested &&
    article.revisions.latestRequest?.status !== 'completed'

  const hasFactCheckIssues = article.factCheck.issuesFound > 0

  return (
    <article className="overflow-hidden rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent-bg)] text-[var(--color-accent)]">
              <FileText className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
                {article.category}
              </p>

              <p className="mt-0.5 truncate text-xs text-[var(--color-text-muted)]">
                Updated {new Date(article.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getWorkflowBadgeClass(
              article.workflow.stage,
            )}`}
          >
            {workflowLabels[article.workflow.stage]}
          </span>
        </div>

        <div className="mt-5">
          <h2 className="text-lg font-bold leading-7 text-[var(--color-card-heading)]">
            {article.title}
          </h2>

          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--color-card-text-muted)]">
            {article.excerpt}
          </p>
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-medium text-[var(--color-text-muted)]">
              Workflow progress
            </span>

            <span className="font-semibold text-[var(--color-card-heading)]">
              {article.workflow.completionPercent}%
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-[var(--color-accent)] transition-all"
              style={{
                width: `${Math.min(
                  Math.max(article.workflow.completionPercent, 0),
                  100,
                )}%`,
              }}
            />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Metric
            label="Words"
            value={article.metrics.wordCount.toLocaleString()}
          />

          <Metric
            label="Sources"
            value={article.metrics.sources.toString()}
          />

          <Metric
            label="Evidence"
            value={article.metrics.evidenceItems.toString()}
          />

          <Metric
            label="Media"
            value={article.metrics.mediaItems.toString()}
          />
        </div>

        <div className="mt-5 grid gap-3 border-t border-[var(--color-card-border)] pt-5 sm:grid-cols-2">
          <WorkflowItem
            icon={Users}
            label="Collaboration"
            value={
              article.collaboration.enabled
                ? `${article.collaboration.coAuthors.length} co-author${
                    article.collaboration.coAuthors.length === 1 ? '' : 's'
                  }`
                : 'Solo article'
            }
          />

          <WorkflowItem
            icon={Clock3}
            label="Assignments"
            value={getAssignmentSummary(article)}
          />

          <WorkflowItem
            icon={FlaskConical}
            label="Fact check"
            value={getFactCheckLabel(article)}
            valueClassName={getFactCheckClass(article)}
          />

          <WorkflowItem
            icon={article.submission.ready ? CheckCircle2 : AlertCircle}
            label="Submission"
            value={article.submission.ready ? 'Ready to submit' : 'Not ready'}
            valueClassName={
              article.submission.ready
                ? 'text-emerald-600'
                : 'text-slate-500'
            }
          />
        </div>

        {(hasOpenRevision || hasFactCheckIssues) && (
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />

              <div>
                <p className="text-sm font-semibold text-amber-800">
                  Action required
                </p>

                <p className="mt-1 text-xs leading-5 text-amber-700">
                  {hasOpenRevision
                    ? article.revisions.latestRequest?.summary
                    : `${article.factCheck.issuesFound} fact-check issue${
                        article.factCheck.issuesFound === 1 ? '' : 's'
                      } need to be resolved.`}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 rounded-xl bg-slate-50 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Next action
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-700">
            {article.workflow.nextAction}
          </p>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <div className="text-xs text-[var(--color-text-muted)]">
            Last action: {article.workflow.lastAction}
          </div>

          <Link
            to={`/dashboard/authors/articles/${article.id}`}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-hover)]"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  )
}

function Metric({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border border-[var(--color-card-border)] bg-slate-50 px-3 py-3">
      <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
      <p className="mt-1 text-sm font-bold text-[var(--color-card-heading)]">
        {value}
      </p>
    </div>
  )
}

function WorkflowItem({
  icon: Icon,
  label,
  value,
  valueClassName = 'text-[var(--color-card-heading)]',
}: {
  icon: typeof Users
  label: string
  value: string
  valueClassName?: string
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0">
        <p className="text-xs text-[var(--color-text-muted)]">{label}</p>

        <p className={`truncate text-sm font-semibold ${valueClassName}`}>
          {value}
        </p>
      </div>
    </div>
  )
}

export function DraftsPage() {
  const drafts = mockAuthorArticles.filter(
    (article) =>
      article.status === 'draft' ||
      article.status === 'in-review',
  )

  const actionRequiredCount = drafts.filter(
    (article) =>
      article.revisions.requested ||
      article.factCheck.issuesFound > 0,
  ).length

  const collaborationCount = drafts.filter(
    (article) => article.collaboration.enabled,
  ).length

  const readyToSubmitCount = drafts.filter(
    (article) => article.submission.ready,
  ).length

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-[var(--color-accent)]">
              Author Workspace
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--color-heading)] sm:text-4xl">
              My Drafts
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">
              Manage your stories from early research through collaboration,
              fact-checking, revisions, and editorial submission.
            </p>
          </div>

          <Link
            to="/dashboard/authors/articles/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-hover)]"
          >
            <FileText className="h-4 w-4" />
            New Article
          </Link>
        </div>
      </header>

      <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={FileText}
          label="Active drafts"
          value={drafts.length}
          description="Stories in progress"
        />

        <SummaryCard
          icon={Users}
          label="Collaborating"
          value={collaborationCount}
          description="Drafts with collaborators"
        />

        <SummaryCard
          icon={AlertCircle}
          label="Action required"
          value={actionRequiredCount}
          description="Revisions or issues"
        />

        <SummaryCard
          icon={CheckCircle2}
          label="Ready to submit"
          value={readyToSubmitCount}
          description="Editorially prepared"
        />
      </section>

      {drafts.length > 0 ? (
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {drafts.map((article) => (
            <DraftCard key={article.id} article={article} />
          ))}
        </section>
      ) : (
        <section className="rounded-2xl border border-dashed border-[var(--color-card-border)] bg-[var(--color-card)] px-6 py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-accent-bg)] text-[var(--color-accent)]">
            <FileText className="h-7 w-7" />
          </div>

          <h2 className="mt-5 text-lg font-bold text-[var(--color-card-heading)]">
            No drafts yet
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--color-card-text-muted)]">
            Start a new article and build your story through research,
            collaboration, verification, and editorial review.
          </p>

          <Link
            to="/dashboard/authors/articles/new"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-hover)]"
          >
            Create your first article
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      )}
    </main>
  )
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: typeof FileText
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

      <p className="mt-4 text-xs text-[var(--color-text-muted)]">
        {description}
      </p>
    </div>
  )
}

