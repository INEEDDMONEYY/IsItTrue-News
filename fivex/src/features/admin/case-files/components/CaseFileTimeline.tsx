
import {
  Activity,
  Archive,
  CheckCircle2,
  FilePlus2,
  FileText,
  FolderPlus,
  MessageSquare,
  RefreshCw,
  ShieldCheck,
  UserPlus,
} from 'lucide-react'

import type {
  CaseFileTimelineEvent,
  CaseFileTimelineEventType,
} from '../types/caseFile.types'

import {
  formatCaseFileDateTime,
} from '../utils/caseFileFormatters'

interface CaseFileTimelineProps {
  events: CaseFileTimelineEvent[]
  loading?: boolean
  emptyMessage?: string
  maxItems?: number
}

const eventIcons: Record<
  CaseFileTimelineEventType,
  typeof Activity
> = {
  created: FolderPlus,
  updated: RefreshCw,
  assignment: UserPlus,
  'status-change': RefreshCw,
  'article-linked': FileText,
  'evidence-added': FilePlus2,
  'source-added': ShieldCheck,
  'fact-check-linked': CheckCircle2,
  review: CheckCircle2,
  note: MessageSquare,
  closed: Archive,
  reopened: RefreshCw,
}

export function CaseFileTimeline({
  events,
  loading = false,
  emptyMessage = 'No activity has been recorded for this case file yet.',
  maxItems,
}: CaseFileTimelineProps) {
  const sortedEvents = [...events].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime(),
  )

  const visibleEvents = maxItems
    ? sortedEvents.slice(0, maxItems)
    : sortedEvents

  if (loading) {
    return (
      <div className="space-y-5" aria-label="Loading timeline">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex gap-3">
            <div className="size-9 shrink-0 animate-pulse rounded-full bg-neutral-100 dark:bg-neutral-800" />
            <div className="flex-1 space-y-2 pt-1">
              <div className="h-4 w-2/3 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
              <div className="h-3 w-full animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
              <div className="h-3 w-1/3 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (visibleEvents.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-200 px-5 py-10 text-center dark:border-neutral-800">
        <Activity
          size={24}
          className="mx-auto text-neutral-400"
        />
        <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
          {emptyMessage}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-0">
      {visibleEvents.map((event, index) => {
        const Icon = eventIcons[event.type] || Activity
        const isLast = index === visibleEvents.length - 1

        return (
          <div key={event.id} className="relative flex gap-3 sm:gap-4">
            <div className="relative flex flex-col items-center">
              <div className="z-10 flex size-9 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
                <Icon size={16} />
              </div>

              {!isLast && (
                <div className="absolute top-9 bottom-0 w-px bg-neutral-200 dark:bg-neutral-800" />
              )}
            </div>

            <div className="min-w-0 flex-1 pb-7">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">
                  {event.title}
                </h4>

                <time
                  dateTime={event.createdAt}
                  className="shrink-0 text-xs text-neutral-500 dark:text-neutral-400"
                >
                  {formatCaseFileDateTime(event.createdAt)}
                </time>
              </div>

              <p className="mt-1 text-sm leading-6 text-neutral-600 dark:text-neutral-400">
                {event.description}
              </p>

              <div className="mt-2 flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                <span className="font-medium text-neutral-700 dark:text-neutral-300">
                  {event.actor.name}
                </span>
                <span aria-hidden="true">·</span>
                <span>{event.actor.role}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default CaseFileTimeline
