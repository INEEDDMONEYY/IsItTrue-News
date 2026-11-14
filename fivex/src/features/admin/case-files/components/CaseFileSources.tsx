
import {
  BookOpen,
  ExternalLink,
  Globe2,
  Landmark,
  Newspaper,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import type { CaseFileLinkedItem } from '../types/caseFile.types'

interface CaseFileSourcesProps {
  sources: CaseFileLinkedItem[]
  loading?: boolean
  onSourceClick?: (source: CaseFileLinkedItem) => void
  emptyMessage?: string
}

function getSourceIcon(type: string) {
  const normalized = type.toLowerCase()

  if (
    normalized.includes('government') ||
    normalized.includes('official') ||
    normalized.includes('public record')
  ) {
    return Landmark
  }

  if (
    normalized.includes('news') ||
    normalized.includes('publication') ||
    normalized.includes('media')
  ) {
    return Newspaper
  }

  if (
    normalized.includes('interview') ||
    normalized.includes('individual') ||
    normalized.includes('person')
  ) {
    return UserRound
  }

  if (
    normalized.includes('research') ||
    normalized.includes('academic') ||
    normalized.includes('study')
  ) {
    return BookOpen
  }

  return Globe2
}

function getVerificationStyle(status?: string) {
  const normalized = status?.toLowerCase() ?? ''

  if (
    normalized.includes('verified') ||
    normalized.includes('confirmed') ||
    normalized.includes('reliable')
  ) {
    return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
  }

  if (
    normalized.includes('pending') ||
    normalized.includes('review')
  ) {
    return 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
  }

  if (
    normalized.includes('unverified') ||
    normalized.includes('disputed') ||
    normalized.includes('unreliable')
  ) {
    return 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400'
  }

  return 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300'
}

export function CaseFileSources({
  sources,
  loading = false,
  onSourceClick,
  emptyMessage = 'No sources have been linked to this case file yet.',
}: CaseFileSourcesProps) {
  if (loading) {
    return (
      <div className="space-y-3" aria-label="Loading sources">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="flex animate-pulse items-center gap-3 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800"
          >
            <div className="h-10 w-10 rounded-lg bg-neutral-200 dark:bg-neutral-800" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-3 w-2/5 rounded bg-neutral-200 dark:bg-neutral-800" />
              <div className="h-3 w-3/5 rounded bg-neutral-100 dark:bg-neutral-800/70" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (sources.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-300 px-5 py-10 text-center dark:border-neutral-700">
        <Globe2 className="mx-auto h-8 w-8 text-neutral-400" />
        <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
          {emptyMessage}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {sources.map((source) => {
        const Icon = getSourceIcon(source.type)
        const isInteractive = Boolean(onSourceClick)

        const content = (
          <>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
              <Icon className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="truncate text-sm font-semibold text-neutral-900 dark:text-white">
                  {source.title}
                </h4>

                {source.status && (
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getVerificationStyle(source.status)}`}
                  >
                    {source.status}
                  </span>
                )}
              </div>

              {source.description && (
                <p className="mt-1 line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">
                  {source.description}
                </p>
              )}

              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500 dark:text-neutral-500">
                <span>{source.type}</span>
                {source.createdAt && (
                  <span>
                    Added {new Date(source.createdAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            {source.status?.toLowerCase().includes('verified') && (
              <ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-emerald-500" />
            )}

            {source.url && !isInteractive && (
              <a
                href={source.url}
                target="_blank"
                rel="noreferrer"
                aria-label={`Open ${source.title}`}
                className="mt-1 shrink-0 rounded-md p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-white"
                onClick={(event) => event.stopPropagation()}
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </>
        )

        const className =
          'flex w-full items-start gap-3 rounded-xl border border-neutral-200 bg-white p-4 text-left transition-colors dark:border-neutral-800 dark:bg-neutral-900'

        return isInteractive ? (
          <button
            key={source.id}
            type="button"
            onClick={() => onSourceClick?.(source)}
            className={`${className} hover:border-neutral-400 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 dark:hover:border-neutral-600 dark:hover:bg-neutral-800/60`}
          >
            {content}
          </button>
        ) : (
          <article key={source.id} className={className}>
            {content}
          </article>
        )
      })}
    </div>
  )
}
