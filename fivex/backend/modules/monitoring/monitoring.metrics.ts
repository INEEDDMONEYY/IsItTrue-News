import type { NextFunction, Request, Response } from 'express'
import {
  MONITORING_MAX_ERRORS,
  MONITORING_MAX_REQUEST_SAMPLES,
  MONITORING_WINDOW_MS,
} from './monitoring.constants.js'

interface RequestSample {
  at: number
  durationMs: number
  statusCode: number
}

export interface RecentError {
  at: string
  method: string
  path: string
  message: string
}

const requestSamples: RequestSample[] = []
const recentErrors: RecentError[] = []

// Monitoring's own polling must not count toward API latency or error rates.
const EXCLUDED_PREFIX = '/api/admin/monitoring'

function pruneSamples(now: number): void {
  const cutoff = now - MONITORING_WINDOW_MS
  while (requestSamples.length > 0 && requestSamples[0].at < cutoff) {
    requestSamples.shift()
  }
  if (requestSamples.length > MONITORING_MAX_REQUEST_SAMPLES) {
    requestSamples.splice(0, requestSamples.length - MONITORING_MAX_REQUEST_SAMPLES)
  }
}

export function requestMetricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (!req.originalUrl.startsWith('/api/') || req.originalUrl.startsWith(EXCLUDED_PREFIX)) {
    next()
    return
  }

  const started = process.hrtime.bigint()
  res.on('finish', () => {
    const now = Date.now()
    requestSamples.push({
      at: now,
      durationMs: Number(process.hrtime.bigint() - started) / 1_000_000,
      statusCode: res.statusCode,
    })
    pruneSamples(now)
  })
  next()
}

/** Records an unhandled server error. Only the message is kept, never the stack or request body. */
export function recordUnhandledError(req: Request, error: unknown): void {
  const message = error instanceof Error ? error.message : String(error)
  recentErrors.push({
    at: new Date().toISOString(),
    method: req.method,
    path: req.path,
    message: message.slice(0, 300),
  })
  if (recentErrors.length > MONITORING_MAX_ERRORS) {
    recentErrors.splice(0, recentErrors.length - MONITORING_MAX_ERRORS)
  }
}

export interface ApiMetricsSummary {
  windowMs: number
  requestCount: number
  serverErrorCount: number
  clientErrorCount: number
  serverErrorRate: number
  p50Ms: number | null
  p95Ms: number | null
  requestsPerMinute: number
}

function percentile(sorted: number[], p: number): number | null {
  if (sorted.length === 0) return null
  const index = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1)
  return Math.round(sorted[Math.max(0, index)] * 10) / 10
}

export function getApiMetrics(now = Date.now()): ApiMetricsSummary {
  pruneSamples(now)
  const durations = requestSamples.map((sample) => sample.durationMs).sort((a, b) => a - b)
  const serverErrorCount = requestSamples.filter((sample) => sample.statusCode >= 500).length
  const clientErrorCount = requestSamples.filter(
    (sample) => sample.statusCode >= 400 && sample.statusCode < 500,
  ).length
  const requestCount = requestSamples.length

  return {
    windowMs: MONITORING_WINDOW_MS,
    requestCount,
    serverErrorCount,
    clientErrorCount,
    serverErrorRate: requestCount === 0 ? 0 : serverErrorCount / requestCount,
    p50Ms: percentile(durations, 50),
    p95Ms: percentile(durations, 95),
    requestsPerMinute: Math.round((requestCount / (MONITORING_WINDOW_MS / 60_000)) * 10) / 10,
  }
}

export function getRecentErrors(now = Date.now()): RecentError[] {
  const cutoff = now - MONITORING_WINDOW_MS
  return recentErrors.filter((entry) => Date.parse(entry.at) >= cutoff).slice().reverse()
}
