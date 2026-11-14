
import {
  CalendarDays,
  FileText,
  FolderOpen,
  LockKeyhole,
  UserRound,
} from 'lucide-react'

import type { CaseFile } from '../types/caseFile.types'

import {
  formatCaseFileRelativeTime,
  getCaseFileCategoryLabel,
  getCaseFilePriorityLabel,
  getCaseFileStatusLabel,
} from '../utils/caseFileFormatters'

interface CaseFileCardProps {
  caseFile: CaseFile
  onClick?: (caseFile: CaseFile) => void
}

const statusStyles: Record<string, string> = {
  draft: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
  active: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
  'under-review': 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
  published: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
  closed: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
  archived: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400',
}

const priorityStyles: Record<string, string> = {
  low: 'text-neutral-500',
  normal: 'text-blue-600 dark:text-blue-400',
  high: 'text-amber-600 dark:text-amber-400',
  critical: 'text-red-600 dark:text-red-400',
}

export function CaseFileCard({
  caseFile,
  onClick,
}: CaseFileCardProps) {
  const linkedCount =
    caseFile.relatedArticles.length +
    caseFile.evidence.length +
    caseFile.media.length +
    caseFile.sources.length +
    caseFile.factChecks.length

  const cardContent = (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold tracking-wide text-neutral-500 dark:text-neutral-400">
          {caseFile.reference}
        </span>

        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            statusStyles[caseFile.status]
          }`}
        >
          {getCaseFileStatusLabel(caseFile.status)}
        </span>

        {caseFile.accessLevel !== 'internal' && (
          <span className="inline-flex items-center gap-1 rounded-full border border-neutral-200 px-2 py-1 text-xs text-neutral-600 dark:border-neutral-700 dark:text-neutral-300">
            <LockKeyhole size={12} />
            {caseFile.accessLevel === 'confidential'
              ? 'Confidential'
              : 'Restricted'}
          </span>
        )}
      </div>

      <div className="mt-3">
        <h3 className="line-clamp-2 text-base font-semibold text-neutral-900 transition-colors dark:text-white">
          {caseFile.title}
        </h3>

        <p className="mt-2 line-clamp-2 text-sm leading-6 text-neutral-600 dark:text-neutral-400">
          {caseFile.summary}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-neutral-500 dark:text-neutral-400">
        <span>{getCaseFileCategoryLabel(caseFile.category)}</span>

        <span
          className={`font-semibold ${priorityStyles[caseFile.priority]}`}
        >
          {getCaseFilePriorityLabel(caseFile.priority)} priority
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 pt-4 dark:border-neutral-800">
        <div className="flex min-w-0 items-center gap-2">
          <UserRound
            size={15}
            className="shrink-0 text-neutral-400"
          />
          <span className="truncate text-xs text-neutral-600 dark:text-neutral-400">
            {caseFile.leadInvestigator.name}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
          <CalendarDays size={14} />
          {formatCaseFileRelativeTime(caseFile.updatedAt)}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
        <span className="inline-flex items-center gap-1.5">
          <FolderOpen size={14} />
          {linkedCount} linked records
        </span>

        <span className="inline-flex items-center gap-1.5">
          <FileText size={14} />
          {caseFile.relatedArticles.length} articles
        </span>
      </div>
    </>
  )

  if (!onClick) {
    return (
      <article className="rounded-xl border border-neutral-200 bg-white p-4 transition-colors dark:border-neutral-800 dark:bg-neutral-900 sm:p-5">
        {cardContent}
      </article>
    )
  }

  return (
    <button
      type="button"
      onClick={() => onClick(caseFile)}
      className="group w-full rounded-xl border border-neutral-200 bg-white p-4 text-left transition-all hover:border-neutral-400 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-600 sm:p-5"
    >
      {cardContent}
    </button>
  )
}

export default CaseFileCard
