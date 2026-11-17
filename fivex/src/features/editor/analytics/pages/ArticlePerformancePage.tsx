import { useMemo, useState } from 'react'
import { PageLoader } from '@/components/loaders/PageLoader'
import { LoaderState } from '@/components/loaders/LoaderState'
import { DateRangeSelect } from '../components/DateRangeSelect'
import { ArticleViewsChart } from '../components/ArticleViewsChart'
import { BreakdownTable } from '../components/BreakdownTable'
import { useArticlePerformance } from '../hooks/useEditorialAnalytics'
import { NO_DATA_LABEL, formatCount, formatReadingSeconds, rangeForDays } from '../utils/formatters'

// Only engagement the application records is shown. Metrics it does not collect appear under "Not yet tracked".
export function ArticlePerformancePage() {
  const [days, setDays] = useState(30)
  const query = useMemo(() => rangeForDays(days), [days])
  const { data, isLoading, isError, isFetching, refetch } = useArticlePerformance(query)

  if (isLoading) return <PageLoader />

  if (isError && !data) {
    return (
      <LoaderState title="Couldn't load article performance" message="The analytics service didn't respond." alert>
        <button type="button" onClick={() => refetch()} className="mt-2 text-sm text-accent underline">
          Try again
        </button>
      </LoaderState>
    )
  }

  if (!data) return null

  const cards = [
    { label: 'Article views', value: formatCount(data.totals.views), hint: 'Recorded in period' },
    {
      label: 'Unique visitors',
      value: formatCount(data.totals.uniqueVisitors),
      hint: 'Daily-rotating visitor hash',
    },
    {
      label: 'Average reading time',
      value: formatReadingSeconds(data.totals.averageReadingSeconds),
      hint: `${formatCount(data.totals.readingSampleSize)} reading samples`,
    },
  ]

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-heading mb-1">Article performance</h1>
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

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-card-border bg-card p-5">
            <p className="text-sm text-card-text-muted">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-card-heading">{card.value}</p>
            <p className="mt-1 text-xs text-card-text-muted">{card.hint}</p>
          </div>
        ))}
      </div>

      <section className="mb-8 rounded-2xl border border-card-border bg-card p-5">
        <h2 className="mb-3 text-base font-semibold text-card-heading">Views and visitors by day</h2>
        <ArticleViewsChart data={data.trends.viewsByDay} />
      </section>

      <section className="mb-8 overflow-x-auto rounded-2xl border border-card-border bg-card p-5">
        <h2 className="mb-3 text-base font-semibold text-card-heading">Top articles</h2>
        {data.topArticles.length === 0 ? (
          <p className="text-sm text-card-text-muted">No article views in this period ({NO_DATA_LABEL}).</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="text-left text-card-text-muted">
              <tr>
                <th scope="col" className="py-2 font-medium">Article</th>
                <th scope="col" className="py-2 font-medium">Category</th>
                <th scope="col" className="py-2 font-medium">Views</th>
                <th scope="col" className="py-2 font-medium">Unique visitors</th>
                <th scope="col" className="py-2 font-medium">Avg. reading time</th>
              </tr>
            </thead>
            <tbody>
              {data.topArticles.map((row) => (
                <tr key={row.articleId} className="border-t border-card-border">
                  <td className="py-2 text-card-heading">{row.title}</td>
                  <td className="py-2">{row.category ?? NO_DATA_LABEL}</td>
                  <td className="py-2">{formatCount(row.views)}</td>
                  <td className="py-2">{formatCount(row.uniqueVisitors)}</td>
                  <td className="py-2">{formatReadingSeconds(row.averageReadingSeconds)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <BreakdownTable
          title="Views by category"
          keyLabel="Category"
          rows={data.byCategory.map((r) => ({ key: r.key, count: r.views }))}
          emptyText="No article views in this period."
        />
        <BreakdownTable
          title="Views by publication month"
          keyLabel="Month"
          rows={data.byPublicationMonth.map((r) => ({ key: r.key, count: r.views }))}
          emptyText="No article views in this period."
        />
        <BreakdownTable
          title="Referral sources"
          keyLabel="Host"
          rows={data.referrers.map((r) => ({ key: r.host, count: r.views }))}
          emptyText="No referral data in this period."
        />
      </div>

      {data.unavailable.length > 0 && (
        <section className="mt-8 rounded-2xl border border-card-border bg-card p-5">
          <h2 className="mb-3 text-base font-semibold text-card-heading">Not yet tracked</h2>
          <ul className="space-y-2 text-sm text-card-text-muted">
            {data.unavailable.map((item) => (
              <li key={item.metric}>
                <span className="font-medium text-card-heading">{item.metric}:</span> {item.reason}
              </li>
            ))}
          </ul>
        </section>
      )}

      {data.notes.length > 0 && (
        <ul className="mt-6 space-y-1 text-xs text-text-muted">
          {data.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
