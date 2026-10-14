import { useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react'
import { EmptyStateCard } from '@/components/cards'
import { PageLoader } from '@/components/loaders/PageLoader'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { FactCheckFilters } from '../components/FactCheckFilters'
import { FactCheckOverview } from '../components/FactCheckOverview'
import { FactCheckTable } from '../components/FactCheckTable'
import { useFactChecks } from '../hooks/useAdminFactChecks'
import type { FactCheckListParams } from '../types/factCheck.types'
import { DEFAULT_PARAMS, PAGE_SIZES, hasActiveFilters, paramsFromSearch, searchFromParams } from '../utils/listParams'

export function FactChecksPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const params = paramsFromSearch(searchParams)
  const { data, error, isLoading, isFetching, isPlaceholderData, refetch } = useFactChecks(params)

  const update = (changes: Partial<FactCheckListParams>) => {
    const next = { ...params, ...changes }
    // Narrowing the list can leave the current page past the end, so any change other than paging starts over.
    if (Object.keys(changes).some((key) => key !== 'page')) next.page = 1
    setSearchParams(searchFromParams(next))
  }

  const clearFilters = () =>
    setSearchParams(searchFromParams({ ...DEFAULT_PARAMS, sort: params.sort, order: params.order, pageSize: params.pageSize }))

  const firstShown = data && data.total > 0 ? (data.page - 1) * data.pageSize + 1 : 0
  const lastShown = data ? Math.min(data.page * data.pageSize, data.total) : 0

  return (
    <div>
      <h1 className="text-2xl font-semibold text-heading mb-1">Fact-checks</h1>
      <p className="text-sm text-text-muted mb-6 max-w-3xl">
        Oversee every claim being verified: who is responsible, what evidence backs it, and what was concluded. Open a record to see its
        full decision history, reassign it, or send it back for another look.
      </p>

      <FactCheckOverview activeView={params.view} />

      <FactCheckFilters params={params} onChange={update} onClear={clearFilters} />

      {isLoading && <PageLoader label="Loading fact-check records..." />}

      {error && !data && (
        <div role="alert" className="flex items-center gap-3 text-sm text-disputed">
          <span>{getErrorMessage(error, 'Failed to load fact-check records.')}</span>
          <button type="button" onClick={() => refetch()} className="underline hover:no-underline">
            Try again
          </button>
        </div>
      )}

      {data && data.total === 0 &&
        (hasActiveFilters(params) ? (
          <div className="rounded-2xl border border-dashed border-card-border bg-card p-10 text-center">
            <p className="text-sm font-medium text-card-heading">No fact-check records match these filters.</p>
            <button type="button" onClick={clearFilters} className="mt-2 text-sm text-accent hover:underline">
              Clear filters
            </button>
          </div>
        ) : (
          <EmptyStateCard icon={ShieldCheck} title="No fact-check records yet" description="Records appear here as soon as an editor adds a claim to an article." />
        ))}

      {data && data.total > 0 && data.records.length === 0 && (
        <div className="rounded-2xl border border-dashed border-card-border bg-card p-10 text-center">
          <p className="text-sm font-medium text-card-heading">There are no records on page {data.page}.</p>
          <button type="button" onClick={() => update({ page: 1 })} className="mt-2 text-sm text-accent hover:underline">
            Go to the first page
          </button>
        </div>
      )}

      {data && data.records.length > 0 && (
        <>
          <FactCheckTable records={data.records} isRefreshing={isPlaceholderData || isFetching} />

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-text-muted">
            <p aria-live="polite">
              Showing {firstShown.toLocaleString()}–{lastShown.toLocaleString()} of {data.total.toLocaleString()}
            </p>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                Per page
                <select
                  value={params.pageSize}
                  onChange={(event) => update({ pageSize: Number(event.target.value) })}
                  className="rounded-lg border border-border bg-bg px-2 py-1 text-sm text-heading focus:outline-none focus:ring-2 focus:ring-accent-border"
                >
                  {PAGE_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Previous page"
                  disabled={data.page <= 1}
                  onClick={() => update({ page: data.page - 1 })}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-2 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2 tabular-nums">
                  Page {data.page} of {data.totalPages}
                </span>
                <button
                  type="button"
                  aria-label="Next page"
                  disabled={data.page >= data.totalPages}
                  onClick={() => update({ page: data.page + 1 })}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-2 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {error && data && (
        <p role="alert" className="mt-3 text-sm text-disputed">
          {getErrorMessage(error, 'Could not refresh the list.')}
        </p>
      )}
    </div>
  )
}
