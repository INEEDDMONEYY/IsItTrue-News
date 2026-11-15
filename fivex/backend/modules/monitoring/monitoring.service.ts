import mongoose from 'mongoose'
import os from 'node:os'
import { AuditLog } from '../auditLogs/models/AuditLog.js'
import { isMailConfigured } from '../../mail/providers/unosend.provider.js'
import { getApiMetrics, getRecentErrors } from './monitoring.metrics.js'
import {
  MONITORING_BACKEND_GAPS,
  MONITORING_THRESHOLDS,
  type MonitoringStatus,
} from './monitoring.constants.js'

export interface SectionSnapshot {
  id: string
  status: MonitoringStatus
  checkedAt: string
  metrics: Record<string, unknown>
  notes: string[]
}

export interface MonitoringSnapshot {
  generatedAt: string
  sections: SectionSnapshot[]
  backendGaps: { section: string; missing: string }[]
}

const now = () => new Date().toISOString()

function unknown(id: string, note: string): SectionSnapshot {
  return { id, status: 'unknown', checkedAt: now(), metrics: {}, notes: [note] }
}

function worst(statuses: MonitoringStatus[]): MonitoringStatus {
  if (statuses.includes('down')) return 'down'
  if (statuses.includes('unknown')) return 'unknown'
  if (statuses.includes('degraded')) return 'degraded'
  return 'operational'
}

/** Database: readyState plus a timed ping. A failed ping is Down, not Operational. */
async function databaseSection(): Promise<SectionSnapshot> {
  const readyState = mongoose.connection.readyState
  const stateNames: Record<number, string> = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' }
  const state = stateNames[readyState] ?? 'unknown'

  if (readyState !== 1 || !mongoose.connection.db) {
    return { id: 'database', status: 'down', checkedAt: now(), metrics: { state }, notes: ['Database is not connected.'] }
  }

  const started = Date.now()
  try {
    await mongoose.connection.db.admin().ping()
    const pingMs = Date.now() - started
    const status: MonitoringStatus = pingMs > MONITORING_THRESHOLDS.dbPingMsDegraded ? 'degraded' : 'operational'
    return { id: 'database', status, checkedAt: now(), metrics: { state, pingMs }, notes: [] }
  } catch (error) {
    return {
      id: 'database',
      status: 'down',
      checkedAt: now(),
      metrics: { state },
      notes: [`Ping failed: ${error instanceof Error ? error.message : 'unknown error'}`],
    }
  }
}

/** Infrastructure: this process only (no host agent exists), so the section is scoped to the instance. */
function infrastructureSection(): SectionSnapshot {
  const memory = process.memoryUsage()
  const heapUsage = memory.heapTotal === 0 ? 0 : memory.heapUsed / memory.heapTotal
  const totalMem = os.totalmem()
  const [load1] = os.loadavg()
  const status: MonitoringStatus = heapUsage > MONITORING_THRESHOLDS.heapUsageDegraded ? 'degraded' : 'operational'
  return {
    id: 'infrastructure',
    status,
    checkedAt: now(),
    metrics: {
      uptimeSeconds: Math.round(process.uptime()),
      heapUsedMb: Math.round(memory.heapUsed / 1_048_576),
      heapTotalMb: Math.round(memory.heapTotal / 1_048_576),
      rssMb: Math.round(memory.rss / 1_048_576),
      systemMemoryFreeRatio: totalMem === 0 ? null : Math.round((os.freemem() / totalMem) * 1000) / 1000,
      loadAverage1m: Math.round(load1 * 100) / 100,
      cpuCount: os.cpus().length,
      nodeVersion: process.version,
    },
    notes: ['Metrics cover this application instance only.'],
  }
}

function apiSection(): SectionSnapshot {
  const metrics = getApiMetrics()
  if (metrics.requestCount === 0) {
    return { id: 'api', status: 'unknown', checkedAt: now(), metrics: { ...metrics }, notes: ['No requests in the current window.'] }
  }
  const degraded =
    metrics.serverErrorRate > MONITORING_THRESHOLDS.apiServerErrorRateDegraded ||
    (metrics.p95Ms ?? 0) > MONITORING_THRESHOLDS.apiP95MsDegraded
  return {
    id: 'api',
    status: degraded ? 'degraded' : 'operational',
    checkedAt: now(),
    metrics: { ...metrics },
    notes: [],
  }
}

function errorsSection(): SectionSnapshot {
  const errors = getRecentErrors()
  return {
    id: 'errors',
    status: errors.length > 0 ? 'degraded' : 'operational',
    checkedAt: now(),
    metrics: { recentErrorCount: errors.length, recent: errors.slice(0, 20) },
    notes: ['Only error messages are kept in memory; stack traces are written to server logs.'],
  }
}

async function securitySection(): Promise<SectionSnapshot> {
  try {
    const since = new Date(Date.now() - MONITORING_THRESHOLDS.failedLoginWindowMs)
    const failedLogins = await AuditLog.countDocuments({ eventType: 'auth.login_failed', createdAt: { $gte: since } })
    const status: MonitoringStatus =
      failedLogins > MONITORING_THRESHOLDS.failedLoginsPerWindowDegraded ? 'degraded' : 'operational'
    return {
      id: 'security',
      status,
      checkedAt: now(),
      metrics: { failedLoginsInWindow: failedLogins, windowMinutes: MONITORING_THRESHOLDS.failedLoginWindowMs / 60_000 },
      notes: [],
    }
  } catch (error) {
    return unknown('security', `Audit query failed: ${error instanceof Error ? error.message : 'unknown error'}`)
  }
}

async function auditSection(): Promise<SectionSnapshot> {
  try {
    const since = new Date(Date.now() - 24 * 60 * 60_000)
    const [total, system] = await Promise.all([
      AuditLog.countDocuments({ createdAt: { $gte: since } }),
      AuditLog.countDocuments({ createdAt: { $gte: since }, 'actor.type': 'system' }),
    ])
    return {
      id: 'audit',
      status: 'operational',
      checkedAt: now(),
      metrics: { eventsLast24h: total, systemEventsLast24h: system, personEventsLast24h: total - system },
      notes: [],
    }
  } catch (error) {
    return unknown('audit', `Audit query failed: ${error instanceof Error ? error.message : 'unknown error'}`)
  }
}

function emailSection(): SectionSnapshot {
  if (!isMailConfigured()) {
    return unknown('email', 'Mail provider is not configured; delivery status cannot be verified.')
  }
  return { id: 'email', status: 'operational', checkedAt: now(), metrics: { configured: true }, notes: ['Configuration check only; bounce and delivery data are not recorded.'] }
}

function deploymentsSection(): SectionSnapshot {
  const version = process.env.APP_VERSION?.trim()
  const commit = process.env.GIT_SHA?.trim()
  if (!version && !commit) {
    return unknown('deployments', 'APP_VERSION / GIT_SHA are not set, so the running build cannot be identified.')
  }
  return {
    id: 'deployments',
    status: 'operational',
    checkedAt: now(),
    metrics: { version: version ?? null, commit: commit ?? null, startedAt: new Date(Date.now() - process.uptime() * 1000).toISOString() },
    notes: [],
  }
}

/** Builds the full snapshot. Each section is independent so one failure cannot hide the others. */
export async function buildMonitoringSnapshot(): Promise<MonitoringSnapshot> {
  const [database, security, audit] = await Promise.all([databaseSection(), securitySection(), auditSection()])
  const api = apiSection()
  const sections: SectionSnapshot[] = [
    {
      id: 'overview',
      status: worst([database.status, api.status]),
      checkedAt: now(),
      metrics: { database: database.status, api: api.status },
      notes: [],
    },
    infrastructureSection(),
    database,
    api,
    errorsSection(),
    security,
    audit,
    emailSection(),
    deploymentsSection(),
    ...MONITORING_BACKEND_GAPS.map((gap) => unknown(gap.section, gap.missing)),
  ]

  return { generatedAt: now(), sections, backendGaps: MONITORING_BACKEND_GAPS }
}
