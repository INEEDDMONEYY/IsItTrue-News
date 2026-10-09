import { PageLoader } from '@/components/loaders/PageLoader'
import { ReviewQueueCard } from '../components/ReviewQueueCard'
import { useReviewQueue } from '../hooks/useReviewQueue'

export function PendingApprovalsPage() {
  const { articles, isLoading, isError, approve, requestChanges } = useReviewQueue()

  return (
    <div>
      <h1 className="text-2xl font-semibold text-heading mb-1">Pending Approvals</h1>
      <p className="text-sm text-text-muted mb-6">
        Articles submitted by authors, waiting for an editorial decision. Approving publishes the article right away;
        requesting changes sends it back to the author&apos;s drafts with your requirements and note.
      </p>

      {isLoading ? (
        <PageLoader label="Loading submissions..." />
      ) : isError ? (
        <p className="text-sm text-disputed">Couldn&apos;t load the review queue. Please refresh and try again.</p>
      ) : articles.length === 0 ? (
        <div className="rounded-xl border border-card-border bg-card p-8 text-center text-sm text-card-text-muted">
          Nothing is waiting for approval right now.
        </div>
      ) : (
        <div className="flex flex-col gap-3 max-w-3xl">
          {articles.map((article) => (
            <ReviewQueueCard
              key={article.id}
              article={article}
              onApprove={approve}
              onRequestChanges={(id, requirements, note) =>
                requestChanges({ id, requirements, note: note || undefined })
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}
