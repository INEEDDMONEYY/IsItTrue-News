import { Link } from 'react-router-dom'
import { Lock } from 'lucide-react'
import dayjs from '@/lib/dayjs'
import type { PublicTimelineEntry } from '../types/investigation.types'

interface InvestigationTimelineProps {
  entries: PublicTimelineEntry[]
}

/**
 * Public timeline — free/anonymous viewers see the first
 * INVESTIGATION_FREE_LIMITS.freeTimelineEntries entries in full; anything
 * beyond that comes back from the server already stripped of its
 * description and flagged `locked`, so it renders as a blurred teaser with
 * an upgrade prompt instead of leaking content client-side.
 */
export function InvestigationTimeline({ entries }: InvestigationTimelineProps) {
  if (entries.length === 0) return null

  const lockedCount = entries.filter((entry) => entry.locked).length

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-heading">Investigation Timeline</h2>

      <ol className="flex flex-col gap-4 border-l-2 border-card-border pl-5">
        {entries.map((entry) => (
          <li key={entry.id} className="relative">
            <span className="absolute -left-[27px] top-1 h-2.5 w-2.5 rounded-full bg-accent" />
            <p className="text-xs font-medium text-text-dim">{dayjs(entry.date).format('MMM D, YYYY')}</p>
            <p className="text-sm font-semibold text-heading">{entry.title}</p>
            {entry.locked ? (
              <div className="relative mt-1 overflow-hidden rounded-lg">
                <p className="select-none blur-sm text-sm text-text-muted" aria-hidden="true">
                  This timeline entry is available to premium members.
                </p>
                <div className="absolute inset-0 flex items-center gap-1.5 text-xs font-medium text-accent">
                  <Lock className="h-3.5 w-3.5" />
                  Premium only
                </div>
              </div>
            ) : (
              entry.description && <p className="mt-1 text-sm text-text-muted">{entry.description}</p>
            )}
          </li>
        ))}
      </ol>

      {lockedCount > 0 && (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-surface-2 px-6 py-6 text-center">
          <p className="text-sm font-semibold text-heading">
            {lockedCount} more timeline {lockedCount === 1 ? 'entry is' : 'entries are'} available to premium members
          </p>
          <Link
            to="/subscribe"
            className="mt-1 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-hover"
          >
            View plans & subscribe
          </Link>
        </div>
      )}
    </div>
  )
}
