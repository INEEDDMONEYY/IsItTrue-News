
import {
  ArrowLeft,
  Archive,
  CalendarDays,
  Edit3,
  LockKeyhole,
  MoreHorizontal,
} from 'lucide-react'

import type {
  CaseFile,
  CaseFileStatus,
} from '../types/caseFile.types'

import {
  formatCaseFileDate,
  getCaseFilePriorityLabel,
  getCaseFileStatusLabel,
} from '../utils/caseFileFormatters'

interface CaseFileHeaderProps {
  caseFile: CaseFile
  onBack?: () => void
  onEdit?: () => void
  onArchive?: () => void
  onStatusChange?: (status: CaseFileStatus) => void
}

const statusStyles: Record<CaseFileStatus, string> = {
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

export function CaseFileHeader({
  caseFile,
  onBack,
  onEdit,
  onArchive,
  onStatusChange,
}: CaseFileHeaderProps) {
  const canArchive =
    caseFile.status !== 'archived' &&
    caseFile.status !== 'closed'

  return (
    <section className="space-y-5">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to case files
        </button>
      )}

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
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

            <span
              className={`text-xs font-semibold ${
                priorityStyles[caseFile.priority]
              }`}
            >
              {getCaseFilePriorityLabel(caseFile.priority)} priority
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

          <h1 className="mt-4 text-2xl font-bold tracking-tight text-neutral-950 dark:text-white sm:text-3xl">
            {caseFile.title}
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-neutral-600 dark:text-neutral-400">
            {caseFile.summary}
          </p>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-neutral-500 dark:text-neutral-400">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={14} />
              Created {formatCaseFileDate(caseFile.createdAt)}
            </span>

            <span>
              Lead investigator: {caseFile.leadInvestigator.name}
            </span>

            {caseFile.dueDate && (
              <span>
                Due {formatCaseFileDate(caseFile.dueDate)}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:shrink-0">
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
            >
              <Edit3 size={15} />
              Edit case
            </button>
          )}

          {onStatusChange && (
            <select
              aria-label="Change case file status"
              value={caseFile.status}
              onChange={(event) =>
                onStatusChange(event.target.value as CaseFileStatus)
              }
              className="min-h-10 rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="under-review">Under Review</option>
              <option value="published">Published</option>
              <option value="closed">Closed</option>
              <option value="archived">Archived</option>
            </select>
          )}

          {canArchive && onArchive && (
            <button
              type="button"
              onClick={onArchive}
              aria-label="Archive case file"
              title="Archive case file"
              className="inline-flex size-10 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-600 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              <Archive size={16} />
            </button>
          )}
        </div>
      </div>

      {caseFile.investigationTitle && (
        <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm dark:border-neutral-800 dark:bg-neutral-900/60">
          <MoreHorizontal
            size={16}
            className="shrink-0 text-neutral-500"
          />
          <span className="text-neutral-500 dark:text-neutral-400">
            Linked investigation:
          </span>
          <span className="font-medium text-neutral-800 dark:text-neutral-200">
            {caseFile.investigationTitle}
          </span>
        </div>
      )}
    </section>
  )
}

export default CaseFileHeader
