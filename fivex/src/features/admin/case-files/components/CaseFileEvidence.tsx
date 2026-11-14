
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FileText,
  Image as ImageIcon,
  LockKeyhole,
  ShieldAlert,
} from 'lucide-react'
import type { CaseFileLinkedItem } from '../types/caseFile.types'

interface CaseFileEvidenceProps {
  evidence: CaseFileLinkedItem[]
  loading?: boolean
  onEvidenceClick?: (evidence: CaseFileLinkedItem) => void
  emptyMessage?: string
}

function getEvidenceIcon(type: string) {
  const normalized = type.toLowerCase()

  if (normalized.includes('image') || normalized.includes('photo')) {
    return ImageIcon
  }

  if (normalized.includes('secure') || normalized.includes('confidential')) {
    return LockKeyhole
  }

  if (normalized.includes('report') || normalized.includes('document')) {
    return FileText
  }

  return FileCheck2
}

function getStatusStyle(status?: string) {
  const normalized = status?.toLowerCase() ?? ''

  if (
    normalized.includes('verified') ||
    normalized.includes('approved') ||
    normalized.includes('authenticated')
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
    normalized.includes('rejected') ||
    normalized.includes('disputed') ||
    normalized.includes('flagged')
  ) {
    return 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400'
  }

  return 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300'
}

export function CaseFileEvidence({
  evidence,
  loading = false,
  onEvidenceClick,
  emptyMessage = 'No evidence has been linked to this case file yet.',
}: CaseFileEvidenceProps) {
  if (loading) {
    return (
      <div className="space-y-3" aria-label="Loading evidence">
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

  if (evidence.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-300 px-5 py-10 text-center dark:border-neutral-700">
        <ShieldAlert className="mx-auto h-8 w-8 text-neutral-400" />
        <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
          {emptyMessage}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {evidence.map((item) => {
        const Icon = getEvidenceIcon(item.type)
        const isInteractive = Boolean(onEvidenceClick)
        const itemClassName =
          'flex w-full items-start gap-3 rounded-xl border border-neutral-200 bg-white p-4 text-left transition-colors dark:border-neutral-800 dark:bg-neutral-900'

        const content = (
          <>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
              <Icon className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="truncate text-sm font-semibold text-neutral-900 dark:text-white">
                  {item.title}
                </h4>

                {item.status && (
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getStatusStyle(item.status)}`}
                  >
                    {item.status}
                  </span>
                )}
              </div>

              {item.description && (
                <p className="mt-1 line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">
                  {item.description}
                </p>
              )}

              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500 dark:text-neutral-500">
                <span>{item.type}</span>
                {item.createdAt && (
                  <span>
                    Added{' '}
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            {item.status?.toLowerCase().includes('pending') ? (
              <Clock3 className="mt-1 h-4 w-4 shrink-0 text-amber-500" />
            ) : item.status?.toLowerCase().includes('verified') ? (
              <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-500" />
            ) : item.status?.toLowerCase().includes('disputed') ? (
              <AlertCircle className="mt-1 h-4 w-4 shrink-0 text-red-500" />
            ) : null}
          </>
        )

        return isInteractive ? (
          <button
            key={item.id}
            type="button"
            onClick={() => onEvidenceClick?.(item)}
            className={`${itemClassName} hover:border-neutral-400 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 dark:hover:border-neutral-600 dark:hover:bg-neutral-800/60`}
          >
            {content}
          </button>
        ) : (
          <article key={item.id} className={itemClassName}>
            {content}
          </article>
        )
      })}
    </div>
  )
}
