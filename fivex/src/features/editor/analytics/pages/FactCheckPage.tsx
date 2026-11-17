import { useMemo, useState } from 'react'
import { PageLoader } from '@/components/loaders/PageLoader'
import { LoaderState } from '@/components/loaders/LoaderState'
import { DateRangeSelect } from '../components/DateRangeSelect'
import { BreakdownTable } from '../components/BreakdownTable'
import { useFactChecks } from '../hooks/useEditorialAnalytics'
import { NO_DATA_LABEL, formatCount, formatHours, formatPercent, rangeForDays } from '../utils/formatters'

// Verdicts and workflow counts are reported as the backend returns them. Shares use total decisions as the denominator.
export function FactCheckPage() {
  const [days, setDays] = useState(30)
  const query = useMemo(() => rangeForDays(days), [days])
  const { data, isLoading, isError, isFetching, refetch } = useFactChecks(query)

  if (isLoading) return <PageLoader />

  if (isError && !data) {
    return (
      <LoaderState title="Couldn't load fact-check analytics" message="The analytics service didn't respond." alert>
        <button type="button" onClick={() => refetch()} className="mt-2 text-sm text-accent underline">
          Try again
        </button>
      </LoaderState>
    )
  }

  if (!data) return null

  const cards = [
    { label: 'Total claims', value: formatCount(data.totals.claims), hint: `${formatCount(data.totals.openClaims)} open` },
    {
      label: 'Completed verifications',
      value: formatCount(data.totals.completedClaims),
      hint: `${formatCount(data.verdicts.decisions)} verdicts in period`,
    },
    {
      label: 'Overdue claims',
      value: formatCount(data.totals.overdueClaims),
      hint: `${formatCount(data.totals.unassignedOpenClaims)} open and unassigned`,
    },
    {
      label: 'Average time to verdict',
      value: formatHours(data.turnaround.averageHoursToFirstVerdict),
      hint: `${formatCount(data.turnaround.sampleSize)} claims with a verdict`,
    },
  ]

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-heading mb-1">Fact-check analytics</h1>
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

      <div className="grid gap-6 lg:grid-cols-2">
        <BreakdownTable
          title="Claims by workflow status"
          keyLabel="Status"
          rows={data.workflow.map((r) => ({ key: r.status, count: r.count }))}
          emptyText="No claims recorded."
        />
        <BreakdownTable
          title="Claims by assessment"
          keyLabel="Assessment"
          rows={data.assessments.map((r) => ({ key: r.status, count: r.count }))}
          emptyText="No claims recorded."
        />
        <section className="rounded-2xl border border-card-border bg-card p-5">
          <h2 className="mb-3 text-base font-semibold text-card-heading">Verdict distribution</h2>
          {data.verdicts.byVerdict.length === 0 ? (
            <p className="text-sm text-card-text-muted">No verdicts recorded in this period ({NO_DATA_LABEL}).</p>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="text-left text-card-text-muted">
                <tr>
                  <th scope="col" className="py-2 font-medium">Verdict</th>
                  <th scope="col" className="py-2 font-medium">Count</th>
                  <th scope="col" className="py-2 font-medium">Share</th>
                </tr>
              </thead>
              <tbody>
                {data.verdicts.byVerdict.map((row) => (
                  <tr key={row.verdict} className="border-t border-card-border">
                    <td className="py-2 text-card-heading">{row.verdict.replace(/_/g, ' ')}</td>
                    <td className="py-2">{formatCount(row.count)}</td>
                    <td className="py-2">{formatPercent(row.share)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <p className="mt-3 text-xs text-card-text-muted">
            {formatCount(data.verdicts.disputedDecisions)} disputed · {formatCount(data.verdicts.escalationsOpened)} escalations opened
          </p>
        </section>
        <BreakdownTable
          title="Fact-check requests by status"
          keyLabel="Status"
          rows={data.requests.byStatus.map((r) => ({ key: r.status, count: r.count }))}
          emptyText="No fact-check requests in this period."
        />
      </div>

      <p className="mt-6 text-xs text-text-muted">
        Verdict shares use the number of verdict decisions in the period as the denominator. Average time to verdict is
        measured from claim creation to its first recorded assessment. Average review time for requests:{' '}
        {formatHours(data.requests.averageHoursToReview)} across {formatCount(data.requests.reviewSampleSize)} reviewed requests.
      </p>
    </div>
  )
}
