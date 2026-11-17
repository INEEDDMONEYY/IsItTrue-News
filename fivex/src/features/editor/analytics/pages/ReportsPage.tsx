import { useMemo, useState } from 'react'
import { DateRangeSelect } from '../components/DateRangeSelect'
import { editorialAnalyticsApi } from '../api/editorialAnalytics.api'
import { REPORT_DATASET_OPTIONS, type ReportDataset } from '../types/editorialAnalytics.types'
import { rangeForDays } from '../utils/formatters'

// Each export is produced by the same backend service as its on-screen dashboard, so it shows the same data and authorization.
export function ReportsPage() {
  const [days, setDays] = useState(30)
  const [dataset, setDataset] = useState<ReportDataset>('overview')
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const query = useMemo(() => rangeForDays(days), [days])

  async function handleDownload() {
    setIsDownloading(true)
    setDownloadError(null)
    try {
      const blob = await editorialAnalyticsApi.downloadReportCsv(dataset, query)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `editorial-${dataset}-${query.from}-to-${query.to}.csv`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch {
      setDownloadError('The export could not be created. Check your access and try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-heading mb-1">Reports &amp; exports</h1>
          <p className="text-sm text-text-muted">
            {query.from} to {query.to} (UTC)
          </p>
        </div>
        <DateRangeSelect value={days} onChange={setDays} />
      </div>

      <section className="rounded-2xl border border-card-border bg-card p-5">
        <h2 className="mb-3 text-base font-semibold text-card-heading">Export CSV</h2>
        <div className="flex flex-wrap items-end gap-4">
          <label className="flex flex-col gap-1 text-sm text-card-text-muted">
            Report
            <select
              value={dataset}
              onChange={(event) => setDataset(event.target.value as ReportDataset)}
              className="rounded-lg border border-card-border bg-card px-3 py-2 text-card-heading"
            >
              {REPORT_DATASET_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {isDownloading ? 'Preparing…' : 'Download CSV'}
          </button>
        </div>
        {downloadError && (
          <p role="alert" className="mt-3 text-sm text-red-700">
            {downloadError}
          </p>
        )}
        <p className="mt-4 text-xs text-text-muted">
          Exports include author names, so they carry the same personal data as the dashboard. They never include internal notes or private evidence content.
        </p>
      </section>
    </div>
  )
}
