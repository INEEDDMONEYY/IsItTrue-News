import { useMemo, useState } from 'react'
import { PageLoader } from '@/components/loaders/PageLoader'
import { LoaderState } from '@/components/loaders/LoaderState'
import { DateRangeSelect } from '../components/DateRangeSelect'
import { BreakdownTable } from '../components/BreakdownTable'
import { useWorkflow } from '../hooks/useEditorialAnalytics'
import { NO_DATA_LABEL, formatCount, formatHours, rangeForDays } from '../utils/formatters'

// Missing metrics come from the backend `unavailable` list. They are shown as notes, never estimated.
export function WorkflowPage() {
  const [days, setDays] = useState(30)
  const query = useMemo(() => rangeForDays(days), [days])
  const { data, isLoading, isError, isFetching, refetch } = useWorkflow(query)

  if (isLoading) return <PageLoader />

  if (isError && !data) {
    return (
      <LoaderState title="Couldn't load the editorial workflow" message="The analytics service didn't respond." alert>
        <button type="button" onClick={() => refetch()} className="mt-2 text-sm text-accent underline">
          Try again
        </button>
      </LoaderState>
    )
  }

  if (!data) return null

  const cards = [
    { label: 'Open articles', value: formatCount(data.totals.openArticles), hint: 'In editorial workflow now' },
    { label: 'Overdue articles', value: formatCount(data.totals.overdueArticles), hint: 'Past editorial deadline' },
    { label: 'Pending reviews', value: formatCount(data.totals.pendingReviews), hint: 'Submitted, awaiting a decision' },
    {
      label: 'Average turnaround',
      value: formatHours(data.turnaround.averageHours),
      hint: `${formatCount(data.turnaround.sampleSize)} reviewed articles`,
    },
  ]

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-heading mb-1">Editorial workflow</h1>
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

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-card-border bg-card p-5">
            <p className="text-sm text-card-text-muted">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-card-heading">{card.value}</p>
            <p className="mt-1 text-xs text-card-text-muted">{card.hint}</p>
          </div>
        ))}
      </div>

      <section className="mb-8 overflow-x-auto rounded-2xl border border-card-border bg-card p-5">
        <h2 className="mb-3 text-base font-semibold text-card-heading">Workflow stages</h2>
        {data.stages.length === 0 ? (
          <p className="text-sm text-card-text-muted">No articles are in the editorial workflow.</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="text-left text-card-text-muted">
              <tr>
                <th scope="col" className="py-2 font-medium">Stage</th>
                <th scope="col" className="py-2 font-medium">Open</th>
                <th scope="col" className="py-2 font-medium">Overdue</th>
                <th scope="col" className="py-2 font-medium">Avg. time since submission</th>
              </tr>
            </thead>
            <tbody>
              {data.stages.map((row) => (
                <tr key={row.stage} className="border-t border-card-border">
                  <td className="py-2 text-card-heading">{row.stage}</td>
                  <td className="py-2">{formatCount(row.open)}</td>
                  <td className="py-2">{formatCount(row.overdue)}</td>
                  <td className="py-2">{formatHours(row.averageHoursSinceSubmission)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <BreakdownTable
          title="Returns by day"
          keyLabel="Day"
          rows={data.trends.returnsByDay.map((d) => ({ key: d.day, count: d.returned }))}
          emptyText="No articles were returned in this period."
        />
        <section className="rounded-2xl border border-card-border bg-card p-5">
          <h2 className="mb-3 text-base font-semibold text-card-heading">Recent editor decisions</h2>
          {data.recentDecisions.length === 0 ? (
            <p className="text-sm text-card-text-muted">No editor decisions in this period.</p>
          ) : (
            <ul className="divide-y divide-card-border text-sm">
              {data.recentDecisions.map((d, index) => (
                <li key={`${d.articleId}-${d.createdAt}-${index}`} className="py-2">
                  <p className="text-card-heading">{d.articleTitle}</p>
                  <p className="text-xs text-card-text-muted">
                    {d.decision.replace(/_/g, ' ')} · {d.actorRole} · {new Date(d.createdAt).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
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

      <p className="mt-6 text-xs text-text-muted">
        Overdue counts use each article&apos;s editorial deadline. Turnaround is measured from submission to the first editor
        decision. {data.turnaround.sampleSize === 0 && `No reviewed articles in this period (${NO_DATA_LABEL}).`}
      </p>
    </div>
  )
}
