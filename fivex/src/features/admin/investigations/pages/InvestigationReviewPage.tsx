import { useState } from 'react'
import { Link } from 'react-router-dom'
import dayjs from '@/lib/dayjs'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyStateCard } from '@/components/cards'
import { ClipboardCheck } from 'lucide-react'
import { useInvestigationReviewQueue } from '@/features/authors/hooks/useInvestigationReviewQueue'

/**
 * Editor/admin verification queue — investigations pending a publish
 * decision. This is the "Investigation Oversight" workspace tool; readers
 * and plain authors can never reach this page (route-guarded + server-side
 * authorize('editor', 'admin') on every action here).
 */
export function InvestigationReviewPage() {
  const { investigations, isLoading, publish, reject } = useInvestigationReviewQueue()
  const [reasonDrafts, setReasonDrafts] = useState<Record<string, string>>({})

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    )
  }

  if (investigations.length === 0) {
    return (
      <EmptyStateCard
        icon={ClipboardCheck}
        title="Nothing pending review"
        description="Investigations submitted by authors for editorial review will show up here."
      />
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-heading mb-1">Investigation Oversight</h1>
      <p className="text-sm text-text-muted mb-6">Review, publish, or reject investigations submitted by authors.</p>

      <div className="flex flex-col gap-4">
        {investigations.map((investigation) => (
          <div key={investigation.id} className="rounded-xl border border-card-border bg-card p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Link
                  to={`/author/investigations/${investigation.id}`}
                  className="font-semibold text-card-heading hover:underline"
                >
                  {investigation.title}
                </Link>
                <p className="mt-1 text-sm text-card-text-muted">{investigation.summary}</p>
                <p className="mt-2 text-xs text-card-text-dim">
                  Submitted {dayjs(investigation.updatedAt).format('MMM D, YYYY')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => publish(investigation.id)}
                className="shrink-0 rounded-lg bg-verified px-3 py-1.5 text-sm font-semibold text-white hover:opacity-90"
              >
                Publish
              </button>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <input
                value={reasonDrafts[investigation.id] ?? ''}
                onChange={(event) =>
                  setReasonDrafts((prev) => ({ ...prev, [investigation.id]: event.target.value }))
                }
                placeholder="Reason for rejection"
                className="flex-1 rounded-lg border border-card-border bg-bg px-3 py-2 text-sm text-card-text focus:border-accent-border focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  const reason = (reasonDrafts[investigation.id] ?? '').trim()
                  if (!reason) return
                  reject(investigation.id, reason)
                  setReasonDrafts((prev) => ({ ...prev, [investigation.id]: '' }))
                }}
                disabled={!(reasonDrafts[investigation.id] ?? '').trim()}
                className="shrink-0 rounded-lg border border-disputed/30 bg-disputed/10 px-3 py-1.5 text-sm font-semibold text-disputed disabled:cursor-not-allowed disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
