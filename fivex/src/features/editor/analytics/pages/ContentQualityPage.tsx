import { useMemo, useState } from 'react'
import { PageLoader } from '@/components/loaders/PageLoader'
import { LoaderState } from '@/components/loaders/LoaderState'
import { DateRangeSelect } from '../components/DateRangeSelect'
import { BreakdownTable } from '../components/BreakdownTable'
import { useContentQuality } from '../hooks/useEditorialAnalytics'
import { NO_DATA_LABEL, formatCount, formatPercent, rangeForDays } from '../utils/formatters'

// Quality indicators are shown only when the backend returns a value. Null means "No data", never 0.
export function ContentQualityPage() {
  const [days, setDays] = useState(30)
  const query = useMemo(() => rangeForDays(days), [days])
  const { data, isLoading, isError, isFetching, refetch } = useContentQuality(query)

  if (isLoading) return <PageLoader />

  if (isError && !data) {
    return (
      <LoaderState title="Couldn't load content quality" message="The analytics service didn't respond." alert>
        <button type="button" onClick={() => refetch()} className="mt-2 text-sm text-accent underline">
          Try again
        </button>
      </LoaderState>
    )
  }

  if (!data) return null
  const q = data.quality

  const cards: Array<{ label: string; value: string; hint: string }> = [
    {
      label: 'Return for revision',
      value: formatPercent(q.returnForRevisionRate),
      hint: `${formatCount(q.changesRequestedDecisions)} of ${formatCount(q.decisionSampleSize)} decisions`,
    },
    {
      label: 'Repeat returns',
      value: formatPercent(q.repeatReturnRate),
      hint: `${formatCount(q.articlesReturnedRepeatedly)} of ${formatCount(q.articlesReviewed)} reviewed articles`,
    },
    {
      label: 'Correction rate',
      value: formatPercent(q.correctionRate),
      hint: `${formatCount(q.correctionsReported)} corrections for ${formatCount(q.publishedArticles)} published`,
    },
  ]

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-heading mb-1">Content quality</h1>
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

      <div className="grid gap-6 lg:grid-cols-2">
        <BreakdownTable
          title="Corrections by category"
          rows={data.correctionsByCategory}
          emptyText="No corrections reported in this period."
        />
        <BreakdownTable
          title="Corrections by status"
          rows={data.correctionsByStatus}
          emptyText="No corrections reported in this period."
        />
      </div>

      <p className="mt-6 text-xs text-text-muted">
        Return rate uses editor decisions in the period as its denominator. Correction rate uses articles published
        in the period. Corrections are counted by the date they were reported, not by the date of the original error.
        {data.quality.decisionSampleSize === 0 && ` No editor decisions in this period (${NO_DATA_LABEL}).`}
      </p>
    </div>
  )
}
