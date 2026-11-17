import { useMemo, useState } from 'react'
import { BarChart3, Eye, FileText, Send, Users, Undo2, Clock, Timer } from 'lucide-react'
import { StatCard, EmptyStateCard } from '@/components/cards'
import { PageLoader } from '@/components/loaders/PageLoader'
import { LoaderState } from '@/components/loaders/LoaderState'
import { DateRangeSelect } from '../analytics/components/DateRangeSelect'
import { EditorialTrendChart } from '../analytics/components/EditorialTrendChart'
import { useEditorialOverview } from '../analytics/hooks/useEditorialAnalytics'
import {
  formatCount,
  formatHours,
  formatPercent,
  formatReadingSeconds,
  rangeForDays,
} from '../analytics/utils/formatters'

export function EditorAnalyticsPage() {
  const [days, setDays] = useState(30)
  const query = useMemo(() => rangeForDays(days), [days])
  const { data, isLoading, isError, isFetching, refetch } = useEditorialOverview(query)

  if (isLoading) return <PageLoader />

  if (isError && !data) {
    return (
      <LoaderState title="Couldn't load editorial analytics" message="The analytics service didn't respond." alert>
        <button type="button" onClick={() => refetch()} className="mt-2 text-sm text-accent underline">
          Try again
        </button>
      </LoaderState>
    )
  }

  if (!data) return null
  const { overview, trends, referrers } = data
  const noActivity = overview.articlesSubmitted === 0 && overview.articleViews === 0

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-heading mb-1">Editorial analytics</h1>
          <p className="text-sm text-text-muted">
            {data.range.from} to {data.range.to} (UTC) · Updated {new Date(data.generatedAt).toLocaleTimeString()}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard label="Articles submitted" value={formatCount(overview.articlesSubmitted)} icon={FileText} />
        <StatCard label="Published from submissions" value={formatCount(overview.articlesPublishedFromSubmissions)} icon={Send} />
        <StatCard label="Pending reviews" value={`${formatCount(overview.pendingReviews)} (${formatCount(overview.overdueReviews)} overdue)`} icon={Clock} />
        <StatCard label="Returned for revision" value={`${formatCount(overview.articlesReturned)} · ${formatPercent(overview.returnRate)}`} icon={Undo2} />
        <StatCard label="Active authors" value={formatCount(overview.activeAuthors)} icon={Users} />
        <StatCard label="Avg. review turnaround" value={formatHours(overview.averageTurnaroundHours)} icon={Timer} />
        <StatCard label="Article views" value={formatCount(overview.articleViews)} icon={Eye} />
        <StatCard label="Unique visitors" value={formatCount(overview.uniqueVisitors)} icon={BarChart3} />
      </div>

      {noActivity ? (
        <EmptyStateCard
          icon={BarChart3}
          title="No editorial activity in this period"
          description="Try a longer date range. Figures appear here as articles are submitted and read."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <section className="rounded-2xl border border-card-border bg-card p-5 xl:col-span-2">
            <h2 className="mb-4 text-sm font-semibold text-card-heading">Daily activity</h2>
            <EditorialTrendChart submissionsByDay={trends.submissionsByDay} viewsByDay={trends.viewsByDay} />
          </section>

          <section className="rounded-2xl border border-card-border bg-card p-5">
            <h2 className="mb-4 text-sm font-semibold text-card-heading">Reading</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-card-text-muted">Average reading time</dt>
                <dd className="text-card-heading">{formatReadingSeconds(overview.averageReadingSeconds)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-card-text-muted">Reads with timing data</dt>
                <dd className="text-card-heading">{formatCount(overview.readingSampleSize)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-card-text-muted">Turnaround sample size</dt>
                <dd className="text-card-heading">{formatCount(overview.turnaroundSampleSize)} reviews</dd>
              </div>
            </dl>

            <h3 className="mb-2 mt-6 text-sm font-semibold text-card-heading">Top referrers</h3>
            {referrers.length === 0 ? (
              <p className="text-sm text-card-text-muted">No referrer data in this period.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {referrers.map((referrer) => (
                  <li key={referrer.host} className="flex justify-between gap-3">
                    <span className="truncate text-card-heading">{referrer.host}</span>
                    <span className="text-card-text-muted">{formatCount(referrer.views)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
