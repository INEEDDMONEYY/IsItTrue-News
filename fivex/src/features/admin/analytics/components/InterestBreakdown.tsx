import type { WaitlistInterestKey } from '../types/analytics.types'

const LABELS: Record<WaitlistInterestKey, string> = {
  reader: 'Reading the news',
  author: 'Writing as an author',
  editor: 'Editing and fact-checking',
  organization: 'An organization',
  unspecified: 'Didn’t say',
}

const ORDER: WaitlistInterestKey[] = ['reader', 'author', 'editor', 'organization', 'unspecified']

/** What waitlist sign-ups said they're interested in, as proportional bars. */
export function InterestBreakdown({ byInterest }: { byInterest: Record<WaitlistInterestKey, number> }) {
  const total = ORDER.reduce((sum, key) => sum + byInterest[key], 0)

  return (
    <div className="rounded-2xl border border-card-border bg-card p-5">
      <h2 className="mb-4 text-sm font-semibold text-card-heading">What sign-ups are interested in</h2>

      {total === 0 ? (
        <p className="text-sm text-card-text-muted">No sign-ups yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {ORDER.map((key) => {
            const count = byInterest[key]
            const percent = Math.round((count / total) * 100)
            return (
              <li key={key}>
                <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                  <span className="truncate text-card-text-muted">{LABELS[key]}</span>
                  <span className="shrink-0 font-medium text-card-heading">
                    {count.toLocaleString()} <span className="font-normal text-card-text-dim">· {percent}%</span>
                  </span>
                </div>
                <div
                  className="h-2 overflow-hidden rounded-full bg-card-2"
                  role="progressbar"
                  aria-label={LABELS[key]}
                  aria-valuenow={percent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div className="h-full rounded-full" style={{ width: `${percent}%`, background: 'var(--color-chart-purple)' }} />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
