
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  AlertCircle,
  BookOpen,
  CalendarDays,
  FileCheck2,
  FileText,
  FolderOpen,
  Image as ImageIcon,
  Link2,
  Plus,
  Search,
  ShieldCheck,
  Users,
} from 'lucide-react'

import { CaseFileCard } from '../components/CaseFileCard'
import { CaseFileHeader } from '../components/CaseFileHeader'
import { CaseFileArticles } from '../components/CaseFileArticles'
import { CaseFileEvidence } from '../components/CaseFileEvidence'
import { CaseFileFactChecks } from '../components/CaseFileFactChecks'
import { CaseFileMedia } from '../components/CaseFileMedia'
import { CaseFileSources } from '../components/CaseFileSources'
import { CaseFileTimeline } from '../components/CaseFileTimeline'
import { useCaseFile } from '../hooks/useCaseFile'
import { useCaseFiles } from '../hooks/useCaseFiles'
import {
  formatCaseFileDate,
  getCaseFileAccessLabel,
  getCaseFileCategoryLabel,
  getCaseFilePriorityLabel,
  getCaseFileStatusLabel,
} from '../utils/caseFileFormatters'
import type {
  CaseFile,
  CaseFileCategory,
  CaseFilePriority,
  CaseFileStatus,
  CaseFileLinkedItem,
} from '../types/caseFile.types'

const STATUS_OPTIONS: CaseFileStatus[] = [
  'draft',
  'active',
  'under-review',
  'published',
  'closed',
  'archived',
]

const PRIORITY_OPTIONS: CaseFilePriority[] = ['low', 'normal', 'high', 'critical']

const CATEGORY_OPTIONS: CaseFileCategory[] = [
  'politics',
  'government',
  'business',
  'public-safety',
  'health',
  'technology',
  'environment',
  'education',
  'international',
  'social-issues',
  'other',
]

const selectClassName =
  'rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100'

type CaseFileTab =
  | 'overview'
  | 'articles'
  | 'evidence'
  | 'fact-checks'
  | 'media'
  | 'sources'
  | 'timeline'

const tabs: {
  id: CaseFileTab
  label: string
  icon: typeof FolderOpen
}[] = [
  { id: 'overview', label: 'Overview', icon: FolderOpen },
  { id: 'articles', label: 'Articles', icon: FileText },
  { id: 'evidence', label: 'Evidence', icon: ShieldCheck },
  { id: 'fact-checks', label: 'Fact Checks', icon: FileCheck2 },
  { id: 'media', label: 'Media', icon: ImageIcon },
  { id: 'sources', label: 'Sources', icon: BookOpen },
  { id: 'timeline', label: 'Timeline', icon: CalendarDays },
]

function DetailField({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-neutral-900 dark:text-neutral-100">
        {value}
      </p>
    </div>
  )
}

function SectionHeading({
  title,
  description,
  count,
}: {
  title: string
  description: string
  count?: number
}) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
      <div>
        <h2 className="text-base font-semibold text-neutral-950 dark:text-white">
          {title}
        </h2>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          {description}
        </p>
      </div>

      {count !== undefined && (
        <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
          {count}
        </span>
      )}
    </div>
  )
}

function OverviewTab({ caseFile }: { caseFile: CaseFile }) {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <SectionHeading
          title="Case description"
          description="The full investigative scope and background."
        />

        <p className="whitespace-pre-wrap text-sm leading-7 text-neutral-700 dark:text-neutral-300">
          {caseFile.description || 'No detailed description has been added.'}
        </p>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <SectionHeading
          title="Case information"
          description="Classification, ownership, and case management details."
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <DetailField
            label="Reference"
            value={caseFile.reference}
          />
          <DetailField
            label="Status"
            value={getCaseFileStatusLabel(caseFile.status)}
          />
          <DetailField
            label="Priority"
            value={getCaseFilePriorityLabel(caseFile.priority)}
          />
          <DetailField
            label="Category"
            value={getCaseFileCategoryLabel(caseFile.category)}
          />
          <DetailField
            label="Access level"
            value={getCaseFileAccessLabel(caseFile.accessLevel)}
          />
          <DetailField
            label="Lead investigator"
            value={caseFile.leadInvestigator.name}
          />
          <DetailField
            label="Created"
            value={formatCaseFileDate(caseFile.createdAt)}
          />
          <DetailField
            label="Last updated"
            value={formatCaseFileDate(caseFile.updatedAt)}
          />
          <DetailField
            label="Due date"
            value={
              caseFile.dueDate
                ? formatCaseFileDate(caseFile.dueDate)
                : 'Not assigned'
            }
          />
          {caseFile.closedAt && (
            <DetailField
              label="Closed date"
              value={formatCaseFileDate(caseFile.closedAt)}
            />
          )}
        </div>
      </section>

      {caseFile.investigationId && (
        <section className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <SectionHeading
            title="Linked investigation"
            description="The investigation associated with this case file."
          />

          <div className="flex items-start gap-3 rounded-lg bg-neutral-50 p-4 dark:bg-neutral-800/60">
            <div className="rounded-lg bg-white p-2 text-neutral-600 dark:bg-neutral-900 dark:text-neutral-300">
              <Link2 className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                {caseFile.investigationTitle || 'Linked investigation'}
              </p>
              <p className="mt-1 break-all text-xs text-neutral-500 dark:text-neutral-400">
                Investigation ID: {caseFile.investigationId}
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <SectionHeading
          title="Assigned team"
          description="People currently assigned to this case file."
          count={caseFile.assignedTo.length}
        />

        {caseFile.assignedTo.length > 0 ? (
          <div className="space-y-3">
            {caseFile.assignedTo.map((person) => (
              <div
                key={person.id}
                className="flex items-center gap-3"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-sm font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                  {person.name
                    .split(' ')
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">
                    {person.name}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {person.role}
                  </p>
                </div>

                <span className="hidden text-xs text-neutral-500 dark:text-neutral-500 sm:block">
                  Assigned {formatCaseFileDate(person.assignedAt)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg bg-neutral-50 px-4 py-6 text-center dark:bg-neutral-800/50">
            <Users className="mx-auto h-6 w-6 text-neutral-400" />
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
              No additional team members assigned.
            </p>
          </div>
        )}
      </section>

      {caseFile.tags.length > 0 && (
        <section className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <SectionHeading
            title="Tags"
            description="Topics and labels associated with this case."
          />

          <div className="flex flex-wrap gap-2">
            {caseFile.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          {
            label: 'Articles',
            count: caseFile.relatedArticles.length,
            icon: FileText,
          },
          {
            label: 'Evidence records',
            count: caseFile.evidence.length,
            icon: ShieldCheck,
          },
          {
            label: 'Fact checks',
            count: caseFile.factChecks.length,
            icon: FileCheck2,
          },
          {
            label: 'Media items',
            count: caseFile.media.length,
            icon: ImageIcon,
          },
          {
            label: 'Sources',
            count: caseFile.sources.length,
            icon: BookOpen,
          },
        ].map((item) => {
          const Icon = item.icon

          return (
            <div
              key={item.label}
              className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-neutral-500 dark:text-neutral-400">
                  {item.label}
                </span>
                <Icon className="h-4 w-4 text-neutral-400" />
              </div>
              <p className="mt-2 text-2xl font-bold tabular-nums text-neutral-950 dark:text-white">
                {item.count}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function CaseFilesPage() {
  const navigate = useNavigate()

  const {
    caseFiles,
    pagination,
    summary,
    filters,
    loading,
    error,
    hasActiveFilters,
    updateFilter,
    resetFilters,
    changePage,
  } = useCaseFiles()

  return (
    <div className="min-h-screen space-y-6 bg-neutral-50 p-4 dark:bg-neutral-950 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Case Files
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {summary.totalCases} total · {summary.activeCases} active ·{' '}
            {summary.pendingReview} pending review
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/admin/case-files/create')}
          className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white dark:bg-neutral-100 dark:text-neutral-900"
        >
          <Plus className="h-4 w-4" />
          New case file
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="search"
            value={filters.search}
            onChange={(event) => updateFilter('search', event.target.value)}
            placeholder="Search case files"
            className={`${selectClassName} w-full pl-9`}
          />
        </div>

        <select
          value={filters.status}
          onChange={(event) =>
            updateFilter('status', event.target.value as CaseFileStatus | 'all')
          }
          className={selectClassName}
          aria-label="Filter by status"
        >
          <option value="all">All statuses</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {getCaseFileStatusLabel(status)}
            </option>
          ))}
        </select>

        <select
          value={filters.category}
          onChange={(event) =>
            updateFilter(
              'category',
              event.target.value as CaseFileCategory | 'all',
            )
          }
          className={selectClassName}
          aria-label="Filter by category"
        >
          <option value="all">All categories</option>
          {CATEGORY_OPTIONS.map((category) => (
            <option key={category} value={category}>
              {getCaseFileCategoryLabel(category)}
            </option>
          ))}
        </select>

        <select
          value={filters.priority}
          onChange={(event) =>
            updateFilter(
              'priority',
              event.target.value as CaseFilePriority | 'all',
            )
          }
          className={selectClassName}
          aria-label="Filter by priority"
        >
          <option value="all">All priorities</option>
          {PRIORITY_OPTIONS.map((priority) => (
            <option key={priority} value={priority}>
              {getCaseFilePriorityLabel(priority)}
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="text-sm font-medium text-neutral-600 underline dark:text-neutral-400"
          >
            Clear filters
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-40 animate-pulse rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
            />
          ))}
        </div>
      ) : caseFiles.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-neutral-300 bg-white p-10 text-center dark:border-neutral-700 dark:bg-neutral-900">
          <FolderOpen className="h-8 w-8 text-neutral-400" />
          <p className="font-medium text-neutral-800 dark:text-neutral-200">
            No case files found
          </p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {hasActiveFilters
              ? 'Try clearing the filters.'
              : 'Create a case file to start an investigation.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {caseFiles.map((caseFile: CaseFile) => (
            <CaseFileCard
              key={caseFile.id}
              caseFile={caseFile}
              onClick={(item) => navigate(`/admin/case-files/${item.id}`)}
            />
          ))}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-400">
          <button
            type="button"
            onClick={() => changePage(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="rounded-lg border border-neutral-300 px-3 py-1.5 disabled:opacity-40 dark:border-neutral-700"
          >
            Previous
          </button>
          <span>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            type="button"
            onClick={() => changePage(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="rounded-lg border border-neutral-300 px-3 py-1.5 disabled:opacity-40 dark:border-neutral-700"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export function CaseFilePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<CaseFileTab>('overview')

  const {
    caseFile,
    loading,
    saving,
    error,
    update,
    refresh,
  } = useCaseFile(id)

  const handleStatusChange = async (status: CaseFileStatus) => {
    try {
      await update({ status })
    } catch {
      // The hook exposes the error state for the page to display.
    }
  }

  const handleArchive = async () => {
    if (!caseFile) return

    const confirmed = window.confirm(
      `Archive case file ${caseFile.reference}?`,
    )

    if (!confirmed) return

    try {
      await update({ status: 'archived' })
      navigate('/admin/case-files')
    } catch {
      // The hook exposes the error state for the page to display.
    }
  }

  const handleLinkedItemClick = (item: CaseFileLinkedItem) => {
    if (item.url) {
      window.open(item.url, '_blank', 'noopener,noreferrer')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen space-y-5 bg-neutral-50 p-4 dark:bg-neutral-950 sm:p-6 lg:p-8">
        <div className="h-5 w-32 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-48 animate-pulse rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900" />
        <div className="h-12 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-64 animate-pulse rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900" />
      </div>
    )
  }

  if (error || !caseFile) {
    return (
      <div className="min-h-screen bg-neutral-50 p-4 dark:bg-neutral-950 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-xl rounded-xl border border-neutral-200 bg-white p-8 text-center dark:border-neutral-800 dark:bg-neutral-900">
          <AlertCircle className="mx-auto h-9 w-9 text-neutral-400" />

          <h1 className="mt-4 text-lg font-semibold text-neutral-950 dark:text-white">
            Unable to load case file
          </h1>

          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            {error || 'The requested case file could not be found.'}
          </p>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={refresh}
              className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
            >
              Try again
            </button>

            <button
              type="button"
              onClick={() => navigate('/admin/case-files')}
              className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
            >
              Back to case files
            </button>
          </div>
        </div>
      </div>
    )
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'articles':
        return (
          <section className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <SectionHeading
              title="Linked articles"
              description="Published articles and editorial drafts connected to this case."
              count={caseFile.relatedArticles.length}
            />
            <CaseFileArticles
              articles={caseFile.relatedArticles}
              onArticleClick={handleLinkedItemClick}
            />
          </section>
        )

      case 'evidence':
        return (
          <section className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <SectionHeading
              title="Evidence records"
              description="Documents, records, and supporting materials collected for this case."
              count={caseFile.evidence.length}
            />
            <CaseFileEvidence
              evidence={caseFile.evidence}
              onEvidenceClick={handleLinkedItemClick}
            />
          </section>
        )

      case 'fact-checks':
        return (
          <section className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <SectionHeading
              title="Linked fact checks"
              description="Verification records and published fact checks connected to this case."
              count={caseFile.factChecks.length}
            />
            <CaseFileFactChecks
              factChecks={caseFile.factChecks}
              onFactCheckClick={handleLinkedItemClick}
            />
          </section>
        )

      case 'media':
        return (
          <section className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <SectionHeading
              title="Case media"
              description="Images, recordings, video, and other media attached to this case."
              count={caseFile.media.length}
            />
            <CaseFileMedia
              media={caseFile.media}
              onMediaClick={handleLinkedItemClick}
            />
          </section>
        )

      case 'sources':
        return (
          <section className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <SectionHeading
              title="Research sources"
              description="Sources used to support or investigate the case."
              count={caseFile.sources.length}
            />
            <CaseFileSources
              sources={caseFile.sources}
              onSourceClick={handleLinkedItemClick}
            />
          </section>
        )

      case 'timeline':
        return (
          <section className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <SectionHeading
              title="Case activity"
              description="A chronological record of important case-file activity."
              count={caseFile.timeline.length}
            />
            <CaseFileTimeline events={caseFile.timeline} />
          </section>
        )

      case 'overview':
      default:
        return <OverviewTab caseFile={caseFile} />
    }
  }

  return (
    <div className="min-h-screen space-y-6 bg-neutral-50 p-4 dark:bg-neutral-950 sm:p-6 lg:p-8">
      <CaseFileHeader
        caseFile={caseFile}
        onBack={() => navigate('/admin/case-files')}
        onEdit={() => navigate(`/admin/case-files/${caseFile.id}/edit`)}
        onArchive={handleArchive}
        onStatusChange={handleStatusChange}
      />

      {saving && (
        <div className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
          Saving case-file changes...
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="overflow-x-auto border-b border-neutral-200 dark:border-neutral-800">
          <nav
            aria-label="Case file sections"
            className="flex min-w-max gap-1 px-2 pt-2 sm:px-4"
          >
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`inline-flex items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium transition ${
                    isActive
                      ? 'border-neutral-900 text-neutral-950 dark:border-white dark:text-white'
                      : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-4 sm:p-5">
          {renderActiveTab()}
        </div>
      </div>
    </div>
  )
}
