import { useState } from 'react'
import { Check, X } from 'lucide-react'

interface ReviewItem {
  id: string
  title: string
  author: string
  category: string
  submittedAt: string
}

const INITIAL_QUEUE: ReviewItem[] = [
  {
    id: 'r1',
    title: 'Inside the State\u2019s Push for Renewable Energy Credits',
    author: 'Jordan Blake',
    category: 'Politics',
    submittedAt: '2026-07-10T11:15:00.000Z',
  },
  {
    id: 'r2',
    title: 'School District Proposes Four-Day Week for Fall Term',
    author: 'Priya Natarajan',
    category: 'Local',
    submittedAt: '2026-07-18T08:00:00.000Z',
  },
  {
    id: 'r3',
    title: 'How Rising Rates Are Reshaping the Rental Market',
    author: 'Sam O\u2019Connor',
    category: 'Business',
    submittedAt: '2026-07-22T13:40:00.000Z',
  },
]

export function ReviewQueuePage() {
  const [queue, setQueue] = useState(INITIAL_QUEUE)

  const handleDecision = (id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id))
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-heading mb-1">Review Queue</h1>
      <p className="text-sm text-text-muted mb-6">
        Articles submitted by authors, waiting for editorial approval.
      </p>

      <div className="flex flex-col gap-3">
        {queue.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-card-border bg-card p-4 flex items-center justify-between gap-4"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-card-heading truncate">{item.title}</p>
              <p className="text-xs text-card-text-muted">
                {item.author} · {item.category} · Submitted{' '}
                {new Date(item.submittedAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleDecision(item.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-verified/10 text-verified border border-verified/30 hover:bg-verified/20 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                Approve
              </button>
              <button
                type="button"
                onClick={() => handleDecision(item.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-disputed/10 text-disputed border border-disputed/30 hover:bg-disputed/20 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Reject
              </button>
            </div>
          </div>
        ))}

        {queue.length === 0 && (
          <div className="rounded-xl border border-dashed border-card-border bg-card p-8 text-center text-sm text-card-text-muted">
            The review queue is empty.
          </div>
        )}
      </div>
    </div>
  )
}
