import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, ShieldCheck } from 'lucide-react'
import { PageLoader } from '@/components/loaders/PageLoader'
import { LoaderState } from '@/components/loaders/LoaderState'
import { Pagination } from '@/components/ui/Pagination'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { FactCheckCard } from '../components/FactCheckCard'
import { usePublicFactChecks } from '../hooks/usePublicFactChecks'
import { CLAIM_VERDICTS, type ClaimVerdict } from '../types/publicFactCheck.types'
import { FILTER_ORDER, VERDICT_LABELS } from '../utils/verdicts'

const PAGE_SIZE = 12
const SEARCH_DEBOUNCE_MS = 350

function readParams(search: URLSearchParams) {
  const verdict = search.get('verdict')
  const page = Number.parseInt(search.get('page') ?? '', 10)
  return {
    verdict: CLAIM_VERDICTS.find((option) => option === verdict),
    q: search.get('q')?.trim().slice(0, 100) || undefined,
    page: Number.isFinite(page) && page > 0 ? Math.min(page, 10_000) : 1,
  }
}

export function FactChecksPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { verdict, q, page } = readParams(searchParams)
  const { data, error, isLoading, isFetching, isPlaceholderData, refetch } = usePublicFactChecks({
    verdict,
    q,
    page,
    pageSize: PAGE_SIZE,
  })

  const update = (changes: { verdict?: ClaimVerdict | null; q?: string | null; page?: number }) => {
    const next = new URLSearchParams()
    const nextVerdict = 'verdict' in changes ? changes.verdict : verdict
    const nextQ = 'q' in changes ? changes.q : q
    if (nextVerdict) next.set('verdict', nextVerdict)
    if (nextQ) next.set('q', nextQ)
    // Narrowing the list can leave the current page past the end, so only paging itself keeps the page.
    const nextPage = 'page' in changes ? changes.page : 1
    if (nextPage && nextPage > 1) next.set('page', String(nextPage))
    setSearchParams(next)
  }

  // The box keeps what is being typed; the address (and so the request) only follows after a pause.
  const [search, setSearch] = useState(q ?? '')
  const [seenQuery, setSeenQuery] = useState(q)
  if (q !== seenQuery) {
    setSeenQuery(q)
    if ((q ?? '') !== search.trim()) setSearch(q ?? '')
  }
  useEffect(() => {
    const next = search.trim()
    if (next === (q ?? '')) return
    const timer = window.setTimeout(() => update({ q: next || null }), SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
    // `update` changes identity on every render; only the typed text should restart the timer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const tabs: { value: ClaimVerdict | undefined; label: string; count: number | undefined }[] = [
    { value: undefined, label: 'All', count: data?.counts.all },
    ...FILTER_ORDER.map((option) => ({
      value: option,
      label: VERDICT_LABELS[option].replace(' True', ''),
      count: data?.counts[option],
    })),
  ]
  const filtered = Boolean(verdict || q)

  return (
    <div className="py-6 md:py-10 flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-accent-bg flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5 text-accent" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-heading">Fact Checks</h1>
          <p className="text-sm text-text-muted">
            Claims from our stories, checked against the evidence. Every conclusion shows its reasoning and what is still uncertain.
          </p>
        </div>
      </div>

      <div className="relative max-w-md">
        <label htmlFor="fact-check-search" className="sr-only">
          Search fact checks
        </label>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" aria-hidden="true" />
        <input
          id="fact-check-search"
          type="search"
          value={search}
          maxLength={100}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search claims or stories…"
          className="w-full rounded-xl border border-border bg-bg pl-9 pr-3 py-2 text-sm text-heading placeholder:text-text-dim focus:outline-none focus:ring-2 focus:ring-accent-border"
        />
      </div>

      <div
        role="group"
        aria-label="Filter by verdict"
        className="flex items-center gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {tabs.map((item) => {
          const active = verdict === item.value
          return (
            <button
              key={item.label}
              type="button"
              aria-pressed={active}
              onClick={() => update({ verdict: item.value ?? null })}
              className={`shrink-0 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm border transition-colors ${
                active
                  ? 'bg-heading text-bg border-heading'
                  : 'border-border text-text-muted hover:text-text hover:border-accent-border'
              }`}
            >
              {item.label}
              {item.count !== undefined && <span className="text-xs tabular-nums opacity-80">{item.count.toLocaleString()}</span>}
            </button>
          )
        })}
      </div>

      {isLoading && <PageLoader label="Loading fact checks..." />}

      {error && !data && (
        <LoaderState alert compact message={getErrorMessage(error, 'We could not load the fact checks right now.')}>
          <button type="button" onClick={() => refetch()} className="text-sm text-accent underline hover:no-underline">
            Try again
          </button>
        </LoaderState>
      )}

      {data && data.total === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <p className="text-sm font-medium text-heading">
            {filtered ? 'No fact checks match this filter.' : 'No fact checks have been published yet.'}
          </p>
          {filtered ? (
            <button
              type="button"
              onClick={() => {
                setSearch('')
                update({ verdict: null, q: null })
              }}
              className="mt-2 text-sm text-accent hover:underline"
            >
              Clear filters
            </button>
          ) : (
            <p className="mt-1 text-sm text-text-muted">Check back soon. They appear here as our team finishes reviewing a claim.</p>
          )}
        </div>
      )}

      {data && data.total > 0 && data.factChecks.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <p className="text-sm font-medium text-heading">There are no fact checks on page {data.page}.</p>
          <button type="button" onClick={() => update({ page: 1 })} className="mt-2 text-sm text-accent hover:underline">
            Go to the first page
          </button>
        </div>
      )}

      {data && data.factChecks.length > 0 && (
        <>
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 transition-opacity ${isPlaceholderData || isFetching ? 'opacity-60' : ''}`}
            aria-busy={isPlaceholderData || isFetching}
          >
            {data.factChecks.map((factCheck) => (
              <FactCheckCard key={factCheck.id} factCheck={factCheck} />
            ))}
          </div>
          <Pagination page={data.page} totalPages={data.totalPages} onPageChange={(next) => update({ page: next })} />
        </>
      )}

      {error && data && (
        <p role="alert" className="text-sm text-disputed">
          {getErrorMessage(error, 'Could not refresh the list.')}
        </p>
      )}
    </div>
  )
}
