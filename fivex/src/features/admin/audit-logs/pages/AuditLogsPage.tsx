
import { useState } from 'react'
import {
  Activity,
  Download,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react'

import { AuditLogSummaryCards } from '../components/AuditLogSummaryCards'
import { AuditLogFilters } from '../components/AuditLogFilters'
import { AuditLogTable } from '../components/AuditLogTable'
import { AuditLogDetails } from '../components/AuditLogDetails'

import { useAuditLogs } from '../hooks/useAuditLogs'
import { downloadAuditLogCsv } from '../utils/auditLogExport'

import type { AuditLogEvent } from '../types/auditLog.types'

export function AuditLogsPage() {
  const {
    logs,
    summary,
    pagination,
    filters,
    actors,
    loading,
    summaryLoading,
    error,
    hasActiveFilters,
    updateFilter,
    resetFilters,
    changePage,
    refresh,
  } = useAuditLogs()

  const [selectedLog, setSelectedLog] =
    useState<AuditLogEvent | null>(null)

  const handleExport = () => {
    if (!logs.length) return

    downloadAuditLogCsv(
      logs,
      `audit-logs-page-${pagination.page}`,
    )
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2 text-sm text-text-muted">
            <ShieldCheck size={16} />
            <span>Administration</span>
            <span>/</span>
            <span>Audit logs</span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">
            Audit logs
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-muted">
            Review administrative activity, monitor security events,
            and track changes made across the platform.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={refresh}
            disabled={loading || summaryLoading}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3.5 py-2 text-sm font-medium text-text transition hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? 'animate-spin' : ''}
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={handleExport}
            disabled={!logs.length || loading}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-neutral-900 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={16} />
            Export page
          </button>
        </div>
      </div>

      {/* Summary metrics */}
      <section aria-label="Audit log summary">
        <AuditLogSummaryCards
          summary={summary}
          loading={summaryLoading}
        />
      </section>

      {/* Activity overview */}
      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Activity size={18} className="text-text-muted" />
              <h2 className="text-base font-semibold text-text">
                Activity history
              </h2>
            </div>

            <p className="mt-1 text-sm text-text-muted">
              Search and filter recorded platform events.
            </p>
          </div>

          <p className="text-sm tabular-nums text-text-muted">
            {pagination.total.toLocaleString()} total events
          </p>
        </div>

        <AuditLogFilters
          filters={filters}
          actors={actors}
          hasActiveFilters={hasActiveFilters}
          onFilterChange={updateFilter}
          onReset={resetFilters}
        />

        {/* Error state */}
        {error && (
          <div
            role="alert"
            className="flex flex-col gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-sm font-medium text-red-600">
                Unable to load audit logs
              </p>
              <p className="mt-1 text-sm text-text-muted">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={refresh}
              className="inline-flex min-h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-text transition hover:bg-surface-secondary"
            >
              <RefreshCw size={14} />
              Try again
            </button>
          </div>
        )}

        {/* Results table */}
        <AuditLogTable
          logs={logs}
          pagination={pagination}
          loading={loading}
          onSelect={setSelectedLog}
          onPageChange={changePage}
        />
      </section>

      {/* Event details */}
      <AuditLogDetails
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  )
}

export default AuditLogsPage
