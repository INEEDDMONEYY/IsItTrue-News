import { useMemo, useState } from 'react'
import { PageLoader } from '@/components/loaders/PageLoader'
import { LoaderState } from '@/components/loaders/LoaderState'
import { DateRangeSelect } from '../components/DateRangeSelect'
import { BreakdownTable } from '../components/BreakdownTable'
import { useInvestigations } from '../hooks/useEditorialAnalytics'
import { NO_DATA_LABEL, formatCount, formatHours, rangeForDays } from '../utils/formatters'

// Author workload lists counts only. It is not a ranking of reporters by output.
export function InvestigationPage() {
  const [days, setDays] = useState(30)
  const query = useMemo(() => rangeForDays(days), [days])
  const { data, isLoading, isError, isFetching, refetch } = useInvestigations(query)

  if (isLoading) return <PageLoader />

  if (isError && !data) {
    return (
      <LoaderState title="Couldn't load investigation analytics" message="The analytics service didn't respond." alert>
        <button type="button" onClick={() => refetch()} className="mt-2 text-sm text-accent underline">
          Try again
        </button>
      </LoaderState>
    )
  }

  if (!data) return null

  const cards = [
    {
      label: 'Open investigations',
      value: formatCount(data.totals.openInvestigations),
      hint: `${formatCount(data.totals.investigations)} total`,
    },
    {
      label: 'Awaiting editorial review',
      value: formatCount(data.totals.awaitingEditorialReview),
      hint: 'Pending review status',
    },
    {
      label: 'Overdue investigations',
      value: formatCount(data.totals.overdueInvestigations),
      hint: 'Past their deadline',
    },
    {
      label: 'Average time to publication',
      value: formatHours(data.completion.averageHoursToPublication),
      hint: `${formatCount(data.completion.sampleSize)} published investigations`,
    },
  ]

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-heading mb-1">Investigation analytics</h1>
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
          title="Investigation progress by stage"
          keyLabel="Stage"
          rows={data.stages.map((s) => ({ key: s.stage, count: s.open }))}
          emptyText="No open investigations."
        />
        <BreakdownTable
          title="Evidence by kind"
          keyLabel="Kind"
          rows={data.evidence.byKind.map((r) => ({ key: r.kind, count: r.count }))}
          emptyText="No evidence recorded in this period."
        />
        <BreakdownTable
          title="Evidence by visibility"
          keyLabel="Visibility"
          rows={data.evidence.byVisibility.map((r) => ({ key: r.visibility, count: r.count }))}
          emptyText="No evidence recorded in this period."
        />
        <BreakdownTable
          title="Open investigations by author"
          keyLabel="Author"
          rows={data.workload.map((w) => ({ key: w.authorName ?? 'Unnamed author', count: w.open }))}
          emptyText="No open investigations assigned."
        />
      </div>

      <p className="mt-6 text-xs text-text-muted">
        Overdue investigations are counted from their deadline. Completion time runs from creation to publication.{' '}
        {data.completion.sampleSize === 0 && `No investigations published in this period (${NO_DATA_LABEL}).`}
      </p>
    </div>
  )
}
