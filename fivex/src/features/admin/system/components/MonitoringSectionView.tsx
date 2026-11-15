import { Link, NavLink } from 'react-router-dom'
import { useMonitoringSnapshot } from '../hooks/useMonitoringSnapshot'
import type { MonitoringSectionSnapshot } from '../types/monitoring.types'
import { SYSTEM_SECTION_LINKS } from '../utils/systemSections'
import {
  formatMetricLabel,
  formatMetricValue,
  formatTimestamp,
  resolveDisplayStatus,
  STATUS_BADGE_CLASSES,
  STATUS_LABELS,
} from '../utils/monitoringStatus'

interface MonitoringSectionViewProps {
  sectionId: string
  title: string
  purpose: string
}

export function MonitoringSectionView({ sectionId, title, purpose }: MonitoringSectionViewProps) {
  const monitoring = useMonitoringSnapshot()
  const section = monitoring.snapshot?.sections.find((item) => item.id === sectionId)
  const gap = monitoring.snapshot?.backendGaps.find((item) => item.section === sectionId)
  const status = resolveDisplayStatus(section, monitoring.isStale)

  return (
    <div className="space-y-6">
      <nav aria-label="Breadcrumb" className="text-sm text-text-muted">
        <ol className="flex flex-wrap items-center gap-2">
          <li><Link to="/admin" className="hover:underline">Admin</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link to="/admin/system/overview" className="hover:underline">System</Link></li>
          <li aria-hidden="true">/</li>
          <li className="text-heading" aria-current="page">{title}</li>
        </ol>
      </nav>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-heading">{title}</h1>
          <p className="text-sm text-text-muted">{purpose}</p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-sm font-medium ${STATUS_BADGE_CLASSES[status]}`}>
          {STATUS_LABELS[status]}
        </span>
      </header>

      <nav aria-label="System sections" className="flex flex-wrap gap-2">
        {SYSTEM_SECTION_LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `rounded-lg border px-3 py-1.5 text-sm ${isActive ? 'border-primary bg-primary/10 text-heading' : 'border-card-border text-text-muted hover:text-heading'}`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      {monitoring.isStale && (
        <div role="status" className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-700">
          Monitoring data is stale or unavailable. Status is shown as Unknown until fresh data arrives.
        </div>
      )}

      {monitoring.error && (
        <div role="alert" className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-600">
          {monitoring.error}
        </div>
      )}

      {gap && (
        <div className="rounded-xl border border-slate-500/40 bg-slate-500/10 p-4 text-sm text-text-muted">
          <p className="font-medium text-heading">Not yet monitored</p>
          <p className="mt-1">{gap.missing}</p>
        </div>
      )}

      <dl className="grid gap-3 text-sm text-text-muted sm:grid-cols-3">
        <div><dt className="inline">Last successful check: </dt><dd className="inline">{formatTimestamp(monitoring.lastSuccessAt)}</dd></div>
        <div><dt className="inline">Refresh interval: </dt><dd className="inline">{Math.round(monitoring.intervalMs / 1000)} s</dd></div>
        <div><dt className="inline">Transport: </dt><dd className="inline">{monitoring.transport}</dd></div>
      </dl>

      {monitoring.snapshot === null ? (
        <p className="text-sm text-text-muted">Loading monitoring data…</p>
      ) : (
        <SectionDetails section={section} />
      )}
    </div>
  )
}

function SectionDetails({ section }: { section: MonitoringSectionSnapshot | undefined }) {
  if (!section) {
    return <p className="text-sm text-text-muted">No monitoring data was returned for this section.</p>
  }

  const entries = Object.entries(section.metrics)

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-card-border bg-card p-5">
        <h2 className="text-lg font-semibold text-card-heading">Metrics</h2>
        <p className="mt-1 text-xs text-card-text-muted">Checked {formatTimestamp(section.checkedAt)}</p>

        {entries.length === 0 ? (
          <p className="mt-4 text-sm text-card-text-muted">No metrics are recorded for this section yet.</p>
        ) : (
          <dl className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {entries.map(([key, value]) => (
              <div key={key} className="rounded-xl border border-card-border p-4">
                <dt className="text-xs uppercase tracking-wide text-card-text-muted">{formatMetricLabel(key)}</dt>
                <dd className="mt-1 break-words text-base font-semibold text-card-heading">{formatMetricValue(value)}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      {section.notes.length > 0 && (
        <section className="rounded-2xl border border-card-border bg-card p-5">
          <h2 className="text-lg font-semibold text-card-heading">Notes</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-card-text-muted">
            {section.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
