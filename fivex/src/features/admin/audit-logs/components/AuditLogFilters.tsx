
import { useState } from 'react'
import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react'

import type {
  AuditLogActor,
  AuditLogCategory,
  AuditLogFilters as AuditLogFilterValues,
  AuditLogOutcome,
  AuditLogSeverity,
} from '../types/auditLog.types'

interface AuditLogFiltersProps {
  filters: AuditLogFilterValues
  actors: AuditLogActor[]
  hasActiveFilters: boolean
  onFilterChange: <K extends keyof AuditLogFilterValues>(
    key: K,
    value: AuditLogFilterValues[K],
  ) => void
  onReset: () => void
}

const categories: {
  value: AuditLogCategory
  label: string
}[] = [
  { value: 'authentication', label: 'Authentication' },
  { value: 'users', label: 'Users' },
  { value: 'roles', label: 'Roles & permissions' },
  { value: 'articles', label: 'Articles' },
  { value: 'fact-checks', label: 'Fact checks' },
  { value: 'investigations', label: 'Investigations' },
  { value: 'case-files', label: 'Case files' },
  { value: 'evidence', label: 'Evidence' },
  { value: 'sources', label: 'Sources' },
  { value: 'newsletter', label: 'Newsletter' },
  { value: 'advertisements', label: 'Advertisements' },
  { value: 'settings', label: 'Settings' },
  { value: 'system', label: 'System' },
]

const inputClassName =
  'h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-text outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10'

export function AuditLogFilters({
  filters,
  actors,
  hasActiveFilters,
  onFilterChange,
  onReset,
}: AuditLogFiltersProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false)

  const advancedFilterCount = [
    filters.category !== 'all',
    filters.severity !== 'all',
    filters.outcome !== 'all',
    filters.actorId !== '',
    filters.startDate !== '',
    filters.endDate !== '',
  ].filter(Boolean).length

  return (
    <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search
            size={17}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="search"
            value={filters.search}
            onChange={(event) =>
              onFilterChange('search', event.target.value)
            }
            placeholder="Search events, administrators, resources, or IP addresses..."
            className={`${inputClassName} pl-10 pr-10`}
            aria-label="Search audit logs"
          />

          {filters.search && (
            <button
              type="button"
              onClick={() => onFilterChange('search', '')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setAdvancedOpen((current) => !current)}
          aria-expanded={advancedOpen}
          className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors ${
            advancedOpen || advancedFilterCount > 0
              ? 'border-accent/40 bg-accent/5 text-accent'
              : 'border-border text-text hover:bg-surface-secondary'
          }`}
        >
          <SlidersHorizontal size={16} />
          Filters

          {advancedFilterCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-bold text-white">
              {advancedFilterCount}
            </span>
          )}

          {advancedOpen ? (
            <ChevronUp size={15} />
          ) : (
            <ChevronDown size={15} />
          )}
        </button>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium text-text-muted transition-colors hover:bg-surface-secondary hover:text-text"
          >
            <RotateCcw size={15} />
            Reset
          </button>
        )}
      </div>

      {advancedOpen && (
        <div className="mt-5 border-t border-border pt-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div>
              <label
                htmlFor="audit-category"
                className="mb-1.5 block text-xs font-semibold text-text-muted"
              >
                Event category
              </label>
              <select
                id="audit-category"
                value={filters.category}
                onChange={(event) =>
                  onFilterChange(
                    'category',
                    event.target.value as AuditLogCategory | 'all',
                  )
                }
                className={inputClassName}
              >
                <option value="all">All categories</option>
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="audit-severity"
                className="mb-1.5 block text-xs font-semibold text-text-muted"
              >
                Severity
              </label>
              <select
                id="audit-severity"
                value={filters.severity}
                onChange={(event) =>
                  onFilterChange(
                    'severity',
                    event.target.value as AuditLogSeverity | 'all',
                  )
                }
                className={inputClassName}
              >
                <option value="all">All severity levels</option>
                <option value="info">Informational</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="audit-outcome"
                className="mb-1.5 block text-xs font-semibold text-text-muted"
              >
                Outcome
              </label>
              <select
                id="audit-outcome"
                value={filters.outcome}
                onChange={(event) =>
                  onFilterChange(
                    'outcome',
                    event.target.value as AuditLogOutcome | 'all',
                  )
                }
                className={inputClassName}
              >
                <option value="all">All outcomes</option>
                <option value="success">Successful</option>
                <option value="failure">Failed</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="audit-actor"
                className="mb-1.5 block text-xs font-semibold text-text-muted"
              >
                Administrator / actor
              </label>
              <select
                id="audit-actor"
                value={filters.actorId}
                onChange={(event) =>
                  onFilterChange('actorId', event.target.value)
                }
                className={inputClassName}
              >
                <option value="">All actors</option>
                {actors.map((actor) => (
                  <option key={actor.id} value={actor.id}>
                    {actor.name} · {actor.role}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="audit-start-date"
                className="mb-1.5 block text-xs font-semibold text-text-muted"
              >
                Start date
              </label>
              <div className="relative">
                <CalendarDays
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                />
                <input
                  id="audit-start-date"
                  type="date"
                  value={filters.startDate}
                  max={filters.endDate || undefined}
                  onChange={(event) =>
                    onFilterChange('startDate', event.target.value)
                  }
                  className={`${inputClassName} pl-9`}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="audit-end-date"
                className="mb-1.5 block text-xs font-semibold text-text-muted"
              >
                End date
              </label>
              <div className="relative">
                <CalendarDays
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                />
                <input
                  id="audit-end-date"
                  type="date"
                  value={filters.endDate}
                  min={filters.startDate || undefined}
                  onChange={(event) =>
                    onFilterChange('endDate', event.target.value)
                  }
                  className={`${inputClassName} pl-9`}
                />
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <label
                htmlFor="audit-sort"
                className="mb-1.5 block text-xs font-semibold text-text-muted"
              >
                Sort by date
              </label>
              <select
                id="audit-sort"
                value={filters.sortOrder}
                onChange={(event) =>
                  onFilterChange(
                    'sortOrder',
                    event.target.value as 'newest' | 'oldest',
                  )
                }
                className={`${inputClassName} sm:w-48`}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </div>

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => setAdvancedOpen(false)}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-neutral-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
