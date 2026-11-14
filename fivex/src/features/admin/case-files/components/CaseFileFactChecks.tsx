
import {
  BadgeCheck,
  Clock3,
  ExternalLink,
  FileCheck2,
  ShieldAlert,
} from 'lucide-react'

import type { CaseFileLinkedItem } from '../types/caseFile.types'

interface CaseFileFactChecksProps {
  factChecks: CaseFileLinkedItem[]
  loading?: boolean
  onFactCheckClick?: (factCheck: CaseFileLinkedItem) => void
  emptyMessage?: string
}

function getStatusStyle(status?: string) {
  const normalized = status?.toLowerCase().replaceAll('_', '-')

  switch (normalized) {
    case 'verified':
    case 'confirmed':
    case 'published':
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'

    case 'false':
    case 'rejected':
    case 'disputed':
      return 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300'

    case 'in-review':
    case 'under-review':
    case 'pending':
      return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'

    default:
      return 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300'
  }
}

function getStatusIcon(status?: string) {
  const normalized = status?.toLowerCase().replaceAll('_', '-')

  if (
    normalized === 'verified' ||
    normalized === 'confirmed' ||
    normalized === 'published'
  ) {
    return <BadgeCheck size={14} />
  }

  if (
    normalized === 'false' ||
    normalized === 'rejected' ||
    normalized === 'disputed'
  ) {
    return <ShieldAlert size={14} />
  }

  if (
    normalized === 'in-review' ||
    normalized === 'under-review' ||
    normalized === 'pending'
  ) {
    return <Clock3 size={14} />
  }

  return <FileCheck2 size={14} />
}

export function CaseFileFactChecks({
  factChecks,
  loading = false,
  onFactCheckClick,
  emptyMessage = 'No fact checks have been linked to this case file yet.',
}: CaseFileFactChecksProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="animate-pulse rounded-xl border border-neutral-200 p-4 dark:border-neutral-800"
          >
            <div className="h-4 w-2/3 rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="mt-3 h-3 w-1/3 rounded bg-neutral-100 dark:bg-neutral-900" />
          </div>
        ))}
      </div>
    )
  }

  if (factChecks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 px-6 py-12 text-center dark:border-neutral-800">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">
          <FileCheck2 size={22} />
        </div>

        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
          No linked fact checks
        </h3>

        <p className="mt-1 max-w-sm text-sm text-neutral-500 dark:text-neutral-400">
          {emptyMessage}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {factChecks.map((factCheck) => {
        const statusStyle = getStatusStyle(factCheck.status)
        const statusIcon = getStatusIcon(factCheck.status)

        const content = (
          <>
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600 dark:bg-neutral-900 dark:text-neutral-300">
                <FileCheck2 size={19} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate text-sm font-semibold text-neutral-900 dark:text-white">
                    {factCheck.title}
                  </h3>

                  {factCheck.status && (
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${statusStyle}`}
                    >
                      {statusIcon}
                      {factCheck.status.replaceAll('-', ' ')}
                    </span>
                  )}
                </div>

                {factCheck.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-neutral-500 dark:text-neutral-400">
                    {factCheck.description}
                  </p>
                )}

                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400">
                  {factCheck.type && (
                    <span className="capitalize">{factCheck.type}</span>
                  )}

                  {factCheck.createdAt && (
                    <span>
                      {new Date(factCheck.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {factCheck.url && !onFactCheckClick && (
              <ExternalLink
                size={16}
                className="ml-3 shrink-0 text-neutral-400"
              />
            )}
          </>
        )

        const className =
          'flex w-full items-start justify-between gap-3 rounded-xl border border-neutral-200 bg-white p-4 text-left transition dark:border-neutral-800 dark:bg-neutral-950'

        if (onFactCheckClick) {
          return (
            <button
              key={factCheck.id}
              type="button"
              onClick={() => onFactCheckClick(factCheck)}
              className={`${className} hover:border-neutral-300 hover:bg-neutral-50 dark:hover:border-neutral-700 dark:hover:bg-neutral-900`}
            >
              {content}
            </button>
          )
        }

        if (factCheck.url) {
          return (
            <a
              key={factCheck.id}
              href={factCheck.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${className} hover:border-neutral-300 hover:bg-neutral-50 dark:hover:border-neutral-700 dark:hover:bg-neutral-900`}
            >
              {content}
            </a>
          )
        }

        return (
          <div key={factCheck.id} className={className}>
            {content}
          </div>
        )
      })}
    </div>
  )
}
