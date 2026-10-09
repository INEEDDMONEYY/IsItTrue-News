import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageLoader } from '@/components/loaders/PageLoader'
import { ReviewFeedbackPanel } from '@/features/authors/components/ReviewFeedbackPanel'
import { useChangesRequested, useReviewQueue } from '../hooks/useReviewQueue'
import type { PendingArticle } from '../types/reviewQueue.types'

type Tab = 'awaiting_review' | 'waiting_on_authors'

function QueueRow({ article, children }: { article: PendingArticle; children?: React.ReactNode }) {
  return (
    <article className="rounded-xl border border-card-border bg-card p-4 flex flex-col gap-3">
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-card-heading break-words">{article.title}</h2>
        <p className="mt-1 text-xs text-card-text-muted">
          {article.author?.name ?? 'Unknown author'} · {article.category}
        </p>
      </div>
      {children}
    </article>
  )
}

export function ReviewQueuePage() {
  const [tab, setTab] = useState<Tab>('awaiting_review')
  const pending = useReviewQueue()
  const waiting = useChangesRequested()

  const tabs: { value: Tab; label: string; count: number }[] = [
    { value: 'awaiting_review', label: 'Awaiting review', count: pending.articles.length },
    { value: 'waiting_on_authors', label: 'Waiting on authors', count: waiting.articles.length },
  ]
  const active = tab === 'awaiting_review' ? pending : waiting

  return (
    <div>
      <h1 className="text-2xl font-semibold text-heading mb-1">Review Queue</h1>
      <p className="text-sm text-text-muted mb-5">
        Track every article in the editorial workflow — what needs your decision and what authors are still fixing.
      </p>

      <div className="mb-5 flex flex-wrap gap-2">
        {tabs.map(({ value, label, count }) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            aria-pressed={tab === value}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              tab === value
                ? 'border-transparent bg-brand-gradient text-on-brand'
                : 'border-border text-text-muted hover:border-accent-border hover:text-accent'
            }`}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {active.isLoading ? (
        <PageLoader label="Loading the queue..." />
      ) : active.isError ? (
        <p className="text-sm text-disputed">Couldn&apos;t load the queue. Please refresh and try again.</p>
      ) : active.articles.length === 0 ? (
        <div className="rounded-xl border border-card-border bg-card p-8 text-center text-sm text-card-text-muted">
          {tab === 'awaiting_review' ? 'Nothing is waiting for review.' : 'No authors are working on changes right now.'}
        </div>
      ) : (
        <div className="flex flex-col gap-3 max-w-3xl">
          {tab === 'awaiting_review'
            ? pending.articles.map((article) => (
                <QueueRow key={article.id} article={article}>
                  <p className="text-xs text-card-text-muted">
                    Submitted {new Date(article.submittedAt ?? article.createdAt).toLocaleDateString()}
                  </p>
                  <Link
                    to="/dashboard/approvals"
                    className="w-fit rounded-lg bg-brand-gradient px-3 py-1.5 text-xs font-medium text-on-brand transition-colors"
                  >
                    Review in Pending Approvals
                  </Link>
                </QueueRow>
              ))
            : waiting.articles.map((article) => (
                <QueueRow key={article.id} article={article}>
                  <ReviewFeedbackPanel review={article} />
                </QueueRow>
              ))}
        </div>
      )}
    </div>
  )
}
