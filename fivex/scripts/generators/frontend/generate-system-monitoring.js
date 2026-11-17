#!/usr/bin/env node

/**
 * IITNews System Monitoring Generator
 *
 * Generates the admin System monitoring feature (15 sections) and connects it
 * to the verified backend contract at /api/admin/monitoring.
 *
 * Examples:
 * node scripts/generators/frontend/generate-system-monitoring.js --dry-run
 * node scripts/generators/frontend/generate-system-monitoring.js
 * node scripts/generators/frontend/generate-system-monitoring.js --root=src/features/_tmp --no-register
 *
 * Options:
 * --root=PATH     Admin feature root inside src/ (default: src/features/admin).
 * --dry-run       Report planned changes without writing anything.
 * --no-register   Generate files but do not edit the admin router.
 * --help          Display help.
 *
 * Safety:
 * - Never overwrites existing files. The only exception is a zero-byte placeholder
 *   (the empty System stubs), which is replaced and reported.
 * - Router registration is validated before any file is written. It is idempotent.
 * - Generated pages are not registered unless the router anchor is found.
 */

import fs from 'node:fs'
import path from 'node:path'
import { getOption, hasFlag } from '../../utils/arguments.js'
import { PROJECT_ROOT, resolveSourceRoot, toProjectRelative } from '../../utils/file-system.js'
import { registerSystemRoutes } from '../../utils/route-registration.js'

if (hasFlag('--help')) {
  console.log(`
IITNews System Monitoring Generator

Usage:
  node scripts/generators/frontend/generate-system-monitoring.js [--dry-run] [--no-register]

Options:
  --root=PATH     Admin feature root inside src/ (default: src/features/admin).
  --dry-run       Report planned changes without writing.
  --no-register   Do not edit src/app/routes/index.tsx.
  --help          Display help.
`)
  process.exit(0)
}

const dryRun = hasFlag('--dry-run')
const noRegister = hasFlag('--no-register')
const ROUTER_FILE = path.join(PROJECT_ROOT, 'src/app/routes/index.tsx')

// Mirrors MONITORING_BACKEND_GAPS in backend/modules/monitoring/monitoring.constants.ts.
const BACKEND_GAPS = [
  'background-jobs',
  'storage-media',
  'integrations',
  'scheduled-tasks',
  'incidents-alerts',
]

// The 15 System sections. Performance reuses the API section data.
const SECTIONS = [
  { file: 'SystemHealthPage', route: 'overview', title: 'Overview', sectionId: 'overview', purpose: 'Overall platform health, incidents, service availability, recent events.' },
  { file: 'SystemInfoPage', route: 'infrastructure', title: 'Infrastructure', sectionId: 'infrastructure', purpose: 'Application instances, server availability, CPU, memory, uptime.' },
  { file: 'SystemDatabasePage', route: 'database', title: 'Database', sectionId: 'database', purpose: 'Connection health, query performance, connection pools, storage, backups.' },
  { file: 'SystemApiMonitoringPage', route: 'api-monitoring', title: 'API Monitoring', sectionId: 'api', purpose: 'Endpoint availability, latency, request volume, error rates.' },
  { file: 'SystemBackgroundJobsPage', route: 'background-jobs', title: 'Background Jobs & Queues', sectionId: 'background-jobs', purpose: 'Pending jobs, failed jobs, retries, processing times, queue backlogs.' },
  { file: 'SystemStorageMediaPage', route: 'storage-media', title: 'Storage & Media', sectionId: 'storage-media', purpose: 'File storage, uploads, media processing, capacity.' },
  { file: 'SystemEmailNotificationsPage', route: 'email-notifications', title: 'Email & Notifications', sectionId: 'email', purpose: 'Delivery status, bounces, failures, provider availability.' },
  { file: 'SystemPerformancePage', route: 'performance', title: 'Performance', sectionId: 'api', purpose: 'Page and API response times, latency trends, throughput.' },
  { file: 'SystemLogsPage', route: 'errors-logs', title: 'Errors & Logs', sectionId: 'errors', purpose: 'Application exceptions, frontend errors, backend errors, stack traces.' },
  { file: 'SystemSecurityPage', route: 'security', title: 'Security', sectionId: 'security', purpose: 'Authentication failures, suspicious activity, rate limits, access events.' },
  { file: 'SystemIncidentsAlertsPage', route: 'incidents-alerts', title: 'Incidents & Alerts', sectionId: 'incidents-alerts', purpose: 'Active incidents, severity, acknowledgements, resolutions.' },
  { file: 'SystemIntegrationsPage', route: 'integrations', title: 'Integrations', sectionId: 'integrations', purpose: 'External providers, webhooks, connected services, failures.' },
  { file: 'SystemScheduledTasksPage', route: 'scheduled-tasks', title: 'Scheduled Tasks', sectionId: 'scheduled-tasks', purpose: 'Cron jobs, recurring processes, last execution, next execution.' },
  { file: 'SystemAuditEventsPage', route: 'audit-events', title: 'Audit & Events', sectionId: 'audit', purpose: 'Administrative actions, configuration changes, system events.' },
  { file: 'SystemDeploymentsPage', route: 'deployments', title: 'Deployments & Versions', sectionId: 'deployments', purpose: 'Application versions, deployment history, build status.' },
]

function fail(message) {
  console.error(message)
  process.exit(1)
}

let root
try {
  root = resolveSourceRoot(getOption('root', 'src/features/admin'))
} catch (error) {
  fail(error.message)
}

const systemDirectory = path.join(root, 'system')
const relativeRoot = toProjectRelative(root)
const routesImportPath = `@/${relativeRoot.replace(/^src\//, '')}/system/routes`

const TYPES = `export type MonitoringStatus = 'operational' | 'degraded' | 'down' | 'unknown'

export interface MonitoringSectionSnapshot {
  id: string
  status: MonitoringStatus
  checkedAt: string
  metrics: Record<string, unknown>
  notes: string[]
}

export interface MonitoringBackendGap {
  section: string
  missing: string
}

export interface MonitoringSnapshot {
  generatedAt: string
  sections: MonitoringSectionSnapshot[]
  backendGaps: MonitoringBackendGap[]
  intervalMs: number
}
`

const STATUS_UTILS = `import type { MonitoringSectionSnapshot, MonitoringStatus } from '../types/monitoring.types'

export const MONITORING_INTERVAL = {
  defaultMs: 30_000,
  minMs: 10_000,
  maxMs: 300_000,
  staleAfterIntervals: 3,
} as const

export function clampInterval(ms: number): number {
  if (!Number.isFinite(ms)) return MONITORING_INTERVAL.defaultMs
  return Math.min(MONITORING_INTERVAL.maxMs, Math.max(MONITORING_INTERVAL.minMs, ms))
}

export function isSnapshotStale(lastSuccessAt: number | null, now: number, intervalMs: number): boolean {
  if (lastSuccessAt === null) return true
  return now - lastSuccessAt > intervalMs * MONITORING_INTERVAL.staleAfterIntervals
}

const KNOWN_STATUSES: readonly MonitoringStatus[] = ['operational', 'degraded', 'down', 'unknown']

/** Missing, stale, or unrecognised data is Unknown. It is never treated as Operational. */
export function resolveDisplayStatus(section: MonitoringSectionSnapshot | undefined, isStale: boolean): MonitoringStatus {
  if (!section || isStale) return 'unknown'
  return KNOWN_STATUSES.includes(section.status) ? section.status : 'unknown'
}

export const STATUS_LABELS: Record<MonitoringStatus, string> = {
  operational: 'Operational',
  degraded: 'Degraded',
  down: 'Down',
  unknown: 'Unknown',
}

export const STATUS_BADGE_CLASSES: Record<MonitoringStatus, string> = {
  operational: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600',
  degraded: 'border-amber-500/40 bg-amber-500/10 text-amber-600',
  down: 'border-red-500/40 bg-red-500/10 text-red-600',
  unknown: 'border-slate-500/40 bg-slate-500/10 text-slate-500',
}

export function formatTimestamp(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return 'Never'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Unknown' : date.toLocaleString()
}

export function formatMetricLabel(key: string): string {
  const spaced = key.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

export function formatMetricValue(value: unknown): string {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'number') return Number.isInteger(value) ? String(value) : value.toFixed(2)
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}
`

const API = `import { apiClient } from '@/api/client'
import { API_BASE_URL } from '@/config/env'
import type { MonitoringSnapshot } from '../types/monitoring.types'

// Matches the backend routes mounted at /api/admin/monitoring.
const MONITORING_BASE = '/api/admin/monitoring'

export async function fetchMonitoringSnapshot(): Promise<MonitoringSnapshot> {
  const response = await apiClient.get<MonitoringSnapshot>(\`\${MONITORING_BASE}/snapshot\`)
  return response.data
}

/** EventSource cannot send an Authorization header, so the stream relies on the session cookie. */
export function getMonitoringStreamUrl(intervalMs: number): string {
  return \`\${API_BASE_URL}\${MONITORING_BASE}/stream?intervalMs=\${intervalMs}\`
}
`

const HOOK = `import { useEffect, useState } from 'react'
import { fetchMonitoringSnapshot, getMonitoringStreamUrl } from '../api/monitoring.api'
import type { MonitoringSnapshot } from '../types/monitoring.types'
import { clampInterval, isSnapshotStale, MONITORING_INTERVAL } from '../utils/monitoringStatus'

export type MonitoringTransport = 'connecting' | 'stream' | 'polling'

interface MonitoringState {
  snapshot: MonitoringSnapshot | null
  lastSuccessAt: number | null
  error: string | null
  transport: MonitoringTransport
}

/**
 * Live monitoring over Server-Sent Events, falling back to polling when the stream
 * fails. Data older than three intervals is reported as stale.
 */
export function useMonitoringSnapshot(requestedIntervalMs: number = MONITORING_INTERVAL.defaultMs) {
  const intervalMs = clampInterval(requestedIntervalMs)
  const [state, setState] = useState<MonitoringState>({
    snapshot: null,
    lastSuccessAt: null,
    error: null,
    transport: 'connecting',
  })
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    let active = true
    let source: EventSource | null = null
    let pollTimer: number | undefined

    const accept = (snapshot: MonitoringSnapshot) => {
      if (!active) return
      setState((prev) => ({ ...prev, snapshot, lastSuccessAt: Date.now(), error: null }))
    }

    const reject = (message: string) => {
      if (active) setState((prev) => ({ ...prev, error: message }))
    }

    const poll = async () => {
      try {
        accept(await fetchMonitoringSnapshot())
      } catch {
        reject('Monitoring data could not be loaded. Affected sections show as Unknown.')
      }
    }

    const startPolling = () => {
      if (!active || pollTimer !== undefined) return
      setState((prev) => ({ ...prev, transport: 'polling' }))
      void poll()
      pollTimer = window.setInterval(() => void poll(), intervalMs)
    }

    if (typeof EventSource === 'undefined') {
      startPolling()
    } else {
      source = new EventSource(getMonitoringStreamUrl(intervalMs), { withCredentials: true })

      source.addEventListener('open', () => {
        if (active) setState((prev) => ({ ...prev, transport: 'stream' }))
      })

      source.addEventListener('snapshot', (event) => {
        try {
          accept(JSON.parse((event as MessageEvent<string>).data) as MonitoringSnapshot)
        } catch {
          reject('Received an invalid monitoring payload.')
        }
      })

      source.addEventListener('error', () => {
        source?.close()
        source = null
        startPolling()
      })
    }

    const clock = window.setInterval(() => setNow(Date.now()), 5_000)

    return () => {
      active = false
      source?.close()
      if (pollTimer !== undefined) window.clearInterval(pollTimer)
      window.clearInterval(clock)
    }
  }, [intervalMs])

  return {
    ...state,
    intervalMs,
    isStale: isSnapshotStale(state.lastSuccessAt, now, intervalMs),
  }
}
`

const SECTION_LINKS = `export interface SystemSectionLink {
  label: string
  to: string
}

export const SYSTEM_SECTION_LINKS: SystemSectionLink[] = [
${SECTIONS.map((section) => `  { label: '${section.title}', to: '/admin/system/${section.route}' },`).join('\n')}
]
`

const SECTION_VIEW = `import { Link, NavLink } from 'react-router-dom'
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
        <span className={\`rounded-full border px-3 py-1 text-sm font-medium \${STATUS_BADGE_CLASSES[status]}\`}>
          {STATUS_LABELS[status]}
        </span>
      </header>

      <nav aria-label="System sections" className="flex flex-wrap gap-2">
        {SYSTEM_SECTION_LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              \`rounded-lg border px-3 py-1.5 text-sm \${isActive ? 'border-primary bg-primary/10 text-heading' : 'border-card-border text-text-muted hover:text-heading'}\`
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
`

function buildRoutes() {
  const imports = SECTIONS.map((section) => `import { ${section.file} } from './pages/${section.file}'`).join('\n')
  const children = SECTIONS.map((section) => `    { path: '${section.route}', element: <${section.file} /> },`).join('\n')
  return `import { Navigate } from 'react-router-dom'
import type { RouteObject } from 'react-router-dom'
${imports}

export const systemRoutes: RouteObject = {
  path: 'system',
  children: [
    { index: true, element: <Navigate to="overview" replace /> },
${children}
  ],
}
`
}

function buildPage(section) {
  return `import { MonitoringSectionView } from '../components/MonitoringSectionView'

export function ${section.file}() {
  return (
    <MonitoringSectionView
      sectionId="${section.sectionId}"
      title="${section.title}"
      purpose="${section.purpose}"
    />
  )
}
`
}

const files = [
  { file: 'types/monitoring.types.ts', content: TYPES },
  { file: 'api/monitoring.api.ts', content: API },
  { file: 'utils/monitoringStatus.ts', content: STATUS_UTILS },
  { file: 'utils/systemSections.ts', content: SECTION_LINKS },
  { file: 'hooks/useMonitoringSnapshot.ts', content: HOOK },
  { file: 'components/MonitoringSectionView.tsx', content: SECTION_VIEW },
  { file: 'routes.tsx', content: buildRoutes() },
  ...SECTIONS.map((section) => ({ file: `pages/${section.file}.tsx`, content: buildPage(section) })),
]

// Validate router registration before writing anything, so a missing anchor leaves no partial output.
let registration = { changed: false, reason: 'skipped', content: null }
if (!noRegister) {
  try {
    const source = fs.readFileSync(ROUTER_FILE, 'utf8')
    const result = registerSystemRoutes(source, routesImportPath)
    registration = { ...result, reason: result.reason }
  } catch (error) {
    fail(`Route registration failed; no files were written. ${error.message}`)
  }
}

const created = []
const replaced = []
const skipped = []

for (const entry of files) {
  const target = path.join(systemDirectory, entry.file)
  const label = toProjectRelative(target)

  if (!fs.existsSync(target)) {
    created.push(label)
  } else if (fs.statSync(target).size === 0) {
    replaced.push(label)
  } else {
    skipped.push(label)
    continue
  }

  if (!dryRun) {
    fs.mkdirSync(path.dirname(target), { recursive: true })
    fs.writeFileSync(target, entry.content, 'utf8')
  }
}

if (registration.changed && !dryRun) {
  fs.writeFileSync(ROUTER_FILE, registration.content, 'utf8')
}

function printList(title, items) {
  console.log(`\n${title} (${items.length})`)
  for (const item of items) console.log(`  - ${item}`)
}

console.log(`System monitoring generator${dryRun ? ' (dry run, nothing written)' : ''}`)
printList('Created', created)
printList('Replaced zero-byte placeholders', replaced)
printList('Skipped existing files', skipped)

if (noRegister) {
  console.log('\nRoute registration: skipped (--no-register)')
} else if (registration.reason === 'already-registered') {
  console.log('\nRoute registration: already registered, router unchanged')
} else {
  console.log(`\nRoute registration: ${dryRun ? 'would register' : 'registered'} in ${toProjectRelative(ROUTER_FILE)}`)
}

console.log('\nBackend data still needed (shown as Unknown until built):')
for (const gap of BACKEND_GAPS) console.log(`  - ${gap}`)
console.log('\nNavigation: the existing System entry in adminNav.ts points to /admin/system, which redirects to overview.')
