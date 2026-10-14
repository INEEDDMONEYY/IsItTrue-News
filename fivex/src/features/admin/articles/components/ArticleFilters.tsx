import { useEffect, useState } from 'react'
import { Search, X } from 'lucide-react'
import type { AdminArticleList, AdminArticleListParams, AdminArticleStatus } from '../types/adminArticle.types'
import { FACT_CHECK_LABELS, FACT_CHECK_ORDER, STATUS_LABELS, STATUS_ORDER } from '../utils/articleLabels'
import { hasActiveFilters } from '../utils/listParams'

interface ArticleFiltersProps {
  params: AdminArticleListParams
  counts: AdminArticleList['counts'] | undefined
  categories: string[]
  onChange: (changes: Partial<AdminArticleListParams>) => void
  onClear: () => void
}

const FIELD_CLASS =
  'rounded-xl border border-border bg-bg px-3 py-2 text-sm text-heading placeholder:text-text-dim focus:outline-none focus:ring-2 focus:ring-accent-border'

const SEARCH_DEBOUNCE_MS = 350

export function ArticleFilters({ params, counts, categories, onChange, onClear }: ArticleFiltersProps) {
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

  const tabs: { value: AdminArticleStatus | undefined; label: string; count: number | undefined }[] = [
    { value: undefined, label: 'All', count: counts?.all },
    ...STATUS_ORDER.map((status) => ({ value: status, label: STATUS_LABELS[status], count: counts?.[status] })),
  ]

  return (
    <div className="flex flex-col gap-4 mb-4">
      <div role="group" aria-label="Filter by status" className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const active = params.status === tab.value
          return (
            <button
              key={tab.label}
              type="button"
              aria-pressed={active}
              onClick={() => onChange({ status: tab.value })}
              className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                active ? 'bg-accent-bg text-accent ring-1 ring-accent-border' : 'text-text-muted hover:text-heading hover:bg-surface-2'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="text-xs tabular-nums opacity-80" aria-label={`${tab.count} articles`}>
                  {tab.count.toLocaleString()}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="relative flex-1 min-w-[14rem] max-w-md">
          <label htmlFor="article-search" className="sr-only">
            Search articles
          </label>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" aria-hidden="true" />
          <input
            id="article-search"
            type="search"
            value={search}
            maxLength={100}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search title, tag, author or article id…"
            className={`${FIELD_CLASS} w-full pl-9`}
          />
        </div>

        <label className="flex flex-col gap-1 text-xs text-text-muted">
          Category
          <select
            value={params.category ?? ''}
            onChange={(event) => onChange({ category: event.target.value || undefined })}
            className={FIELD_CLASS}
          >
            <option value="">All categories</option>
            {/* Keeps a category from the address selectable even if it has no articles now. */}
            {params.category && !categories.includes(params.category) && <option value={params.category}>{params.category}</option>}
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs text-text-muted">
          Fact-check
          <select
            value={params.factCheckStatus ?? ''}
            onChange={(event) => onChange({ factCheckStatus: (event.target.value || undefined) as AdminArticleListParams['factCheckStatus'] })}
            className={FIELD_CLASS}
          >
            <option value="">Any</option>
            {FACT_CHECK_ORDER.map((status) => (
              <option key={status} value={status}>
                {FACT_CHECK_LABELS[status]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs text-text-muted">
          Created from
          <input
            type="date"
            value={params.from ?? ''}
            max={params.to || undefined}
            onChange={(event) => onChange({ from: event.target.value || undefined })}
            className={FIELD_CLASS}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-text-muted">
          to
          <input
            type="date"
            value={params.to ?? ''}
            min={params.from || undefined}
            onChange={(event) => onChange({ to: event.target.value || undefined })}
            className={FIELD_CLASS}
          />
        </label>

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
