import { useEffect, useState } from 'react'
import { ArrowDown, ArrowUp, Search, X } from 'lucide-react'
import { useReviewers } from '../hooks/useAdminFactChecks'
import type { FactCheckListParams, FactCheckSortField } from '../types/factCheck.types'
import {
  ASSESSMENT_LABELS,
  ASSESSMENT_ORDER,
  EVIDENCE_STATE_LABELS,
  EVIDENCE_STATE_ORDER,
  PRIORITY_LABELS,
  PRIORITY_ORDER,
  VIEW_INFO,
  WORKFLOW_LABELS,
  WORKFLOW_ORDER,
} from '../utils/factCheckLabels'
import { SORT_OPTIONS, hasActiveFilters } from '../utils/listParams'

interface FactCheckFiltersProps {
  params: FactCheckListParams
  onChange: (changes: Partial<FactCheckListParams>) => void
  onClear: () => void
}

const FIELD_CLASS =
  'rounded-xl border border-border bg-bg px-3 py-2 text-sm text-heading placeholder:text-text-dim focus:outline-none focus:ring-2 focus:ring-accent-border'

const SEARCH_DEBOUNCE_MS = 350

export function FactCheckFilters({ params, onChange, onClear }: FactCheckFiltersProps) {
  const { data: reviewers = [] } = useReviewers()

  // The box keeps what is being typed; the address (and so the request) only follows after a pause.
  const [search, setSearch] = useState(params.q ?? '')
  // When the address changes from outside (Clear filters, back button), the box follows. A change that merely
  // echoes what was typed is ignored, so pausing after "foo " doesn't swallow the space.
  const [seenQuery, setSeenQuery] = useState(params.q)
  if (params.q !== seenQuery) {
    setSeenQuery(params.q)
    if ((params.q ?? '') !== search.trim()) setSearch(params.q ?? '')
  }
  useEffect(() => {
    const next = search.trim()
    if (next === (params.q ?? '')) return
    const timer = window.setTimeout(() => onChange({ q: next || undefined }), SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
    // onChange changes identity on every render; only the typed text should restart the timer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  return (
    <div id="queue" className="flex flex-col gap-3 mb-4 scroll-mt-6">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-semibold text-heading mr-2">Fact-check queue</h2>
        {params.view !== 'all' && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-bg px-3 py-1 text-xs font-medium text-accent ring-1 ring-accent-border">
            Showing: {VIEW_INFO[params.view].label}
            <button
              type="button"
              aria-label={`Stop filtering by ${VIEW_INFO[params.view].label}`}
              onClick={() => onChange({ view: 'all' })}
              className="hover:text-disputed"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="relative flex-1 min-w-[14rem] max-w-md">
          <label htmlFor="fact-check-search" className="sr-only">
            Search fact-check records
          </label>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" aria-hidden="true" />
          <input
            id="fact-check-search"
            type="search"
            value={search}
            maxLength={100}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search claim, article or reviewer…"
            className={`${FIELD_CLASS} w-full pl-9`}
          />
        </div>

        <label className="flex flex-col gap-1 text-xs text-text-muted">
          Workflow
          <select value={params.workflow ?? ''} onChange={(event) => onChange({ workflow: (event.target.value || undefined) as FactCheckListParams['workflow'] })} className={FIELD_CLASS}>
            <option value="">Any</option>
            {WORKFLOW_ORDER.map((status) => (
              <option key={status} value={status}>
                {WORKFLOW_LABELS[status]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs text-text-muted">
          Assessment
          <select value={params.assessment ?? ''} onChange={(event) => onChange({ assessment: (event.target.value || undefined) as FactCheckListParams['assessment'] })} className={FIELD_CLASS}>
            <option value="">Any</option>
            {ASSESSMENT_ORDER.map((status) => (
              <option key={status} value={status}>
                {ASSESSMENT_LABELS[status]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs text-text-muted">
          Evidence
          <select value={params.evidence ?? ''} onChange={(event) => onChange({ evidence: (event.target.value || undefined) as FactCheckListParams['evidence'] })} className={FIELD_CLASS}>
            <option value="">Any</option>
            {EVIDENCE_STATE_ORDER.map((state) => (
              <option key={state} value={state}>
                {EVIDENCE_STATE_LABELS[state]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs text-text-muted">
          Priority
          <select value={params.priority ?? ''} onChange={(event) => onChange({ priority: (event.target.value || undefined) as FactCheckListParams['priority'] })} className={FIELD_CLASS}>
            <option value="">Any</option>
            {PRIORITY_ORDER.map((priority) => (
              <option key={priority} value={priority}>
                {PRIORITY_LABELS[priority]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs text-text-muted">
          Reviewer
          <select value={params.assignee ?? ''} onChange={(event) => onChange({ assignee: event.target.value || undefined })} className={FIELD_CLASS}>
            <option value="">Anyone</option>
            <option value="unassigned">Unassigned</option>
            {/* Keeps a reviewer from the address selectable until the list has loaded. */}
            {params.assignee && params.assignee !== 'unassigned' && !reviewers.some((r) => r.id === params.assignee) && (
              <option value={params.assignee}>Selected reviewer</option>
            )}
            {reviewers.map((reviewer) => (
              <option key={reviewer.id} value={reviewer.id}>
                {reviewer.name}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-end gap-1">
          <label className="flex flex-col gap-1 text-xs text-text-muted">
            Sort by
            <select value={params.sort} onChange={(event) => onChange({ sort: event.target.value as FactCheckSortField })} className={FIELD_CLASS}>
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => onChange({ order: params.order === 'asc' ? 'desc' : 'asc' })}
            aria-label={params.order === 'asc' ? 'Ascending. Switch to descending.' : 'Descending. Switch to ascending.'}
            title={params.order === 'asc' ? 'Ascending' : 'Descending'}
            className={`${FIELD_CLASS} px-2.5 hover:border-accent-border`}
          >
            {params.order === 'asc' ? <ArrowUp className="w-4 h-4" aria-hidden="true" /> : <ArrowDown className="w-4 h-4" aria-hidden="true" />}
          </button>
        </div>

        {hasActiveFilters(params) && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm text-text-muted hover:text-accent transition-colors"
          >
            <X className="w-4 h-4" aria-hidden="true" />
            Clear filters
          </button>
        )}
      </div>
    </div>
  )
}
