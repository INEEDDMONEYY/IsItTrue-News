import { useMemo, useState } from 'react'
import { PageLoader } from '@/components/loaders/PageLoader'
import { LoaderState } from '@/components/loaders/LoaderState'
import { DateRangeSelect } from '../components/DateRangeSelect'
import { useAuthorPerformance } from '../hooks/useEditorialAnalytics'
import { formatCount, formatHours, rangeForDays } from '../utils/formatters'

// Rows are sorted by the author's name, not by volume, so output counts don't read as a ranking.
export function AuthorPerformancePage() {
  const [days, setDays] = useState(30)
  const query = useMemo(() => rangeForDays(days), [days])
  const { data, isLoading, isError, isFetching, refetch } = useAuthorPerformance({ ...query, limit: 100 })

  if (isLoading) return <PageLoader />

  if (isError && !data) {
    return (
      <LoaderState title="Couldn't load author performance" message="The analytics service didn't respond." alert>
        <button type="button" onClick={() => refetch()} className="mt-2 text-sm text-accent underline">
          Try again
        </button>
      </LoaderState>
    )
  }

  if (!data) return null
  const authors = [...data.authors].sort((a, b) => (a.authorName ?? '').localeCompare(b.authorName ?? ''))

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-heading mb-1">Author performance</h1>
          <p className="text-sm text-text-muted">
            {data.range.from} to {data.range.to} (UTC)
            {isFetching && ' · refreshing'}
          </p>
        </div>
        <DateRangeSelect value={days} onChange={setDays} />
      </div>

      {isError && (
        <div role="alert" className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Showing the last loaded figures. The latest refresh failed, so these may be out of date.
        </div>
      )}

      {authors.length === 0 ? (
        <p className="rounded-2xl border border-card-border bg-card p-6 text-sm text-card-text-muted">
          No author submissions in this period.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-card-border bg-card">
          <table className="min-w-full text-sm">
            <caption className="sr-only">Submitted and published articles per author in the selected period</caption>
            <thead className="text-left text-card-text-muted">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Author</th>
                <th scope="col" className="px-4 py-3 font-medium">Submitted</th>
                <th scope="col" className="px-4 py-3 font-medium">Published</th>
                <th scope="col" className="px-4 py-3 font-medium">Avg. review turnaround</th>
                <th scope="col" className="px-4 py-3 font-medium">Reviews timed</th>
              </tr>
            </thead>
            <tbody>
              {authors.map((author) => (
                <tr key={author.authorId} className="border-t border-card-border">
                  <td className="px-4 py-3 text-card-heading">{author.authorName ?? 'Unnamed author'}</td>
                  <td className="px-4 py-3">{formatCount(author.submitted)}</td>
                  <td className="px-4 py-3">{formatCount(author.published)}</td>
                  <td className="px-4 py-3">{formatHours(author.averageTurnaroundHours)}</td>
                  <td className="px-4 py-3">{formatCount(author.turnaroundSampleSize)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
