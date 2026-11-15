import type { Request, Response } from 'express'
import { asyncHandler } from '../../../utils/asyncHandler.js'
import {
  MONITORING_DEFAULT_INTERVAL_MS,
  MONITORING_MAX_INTERVAL_MS,
  MONITORING_MAX_STREAMS,
  MONITORING_MIN_INTERVAL_MS,
} from '../monitoring.constants.js'
import { buildMonitoringSnapshot } from '../monitoring.service.js'

let activeStreams = 0

function resolveInterval(raw: unknown): number {
  const parsed = Number(raw)
  if (!Number.isFinite(parsed)) return MONITORING_DEFAULT_INTERVAL_MS
  return Math.min(MONITORING_MAX_INTERVAL_MS, Math.max(MONITORING_MIN_INTERVAL_MS, Math.round(parsed)))
}

// Snapshots always answer with no-store so intermediaries never serve stale health data.
const snapshot = asyncHandler(async (_req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store')
  res.json({ ...(await buildMonitoringSnapshot()), intervalMs: MONITORING_DEFAULT_INTERVAL_MS })
})

/**
 * Server-Sent Events stream. EventSource cannot send an Authorization header, so the session cookie
 * authenticates the stream. Clients that cannot hold a stream should use the snapshot endpoint instead.
 */
const stream = async (req: Request, res: Response): Promise<void> => {
  if (activeStreams >= MONITORING_MAX_STREAMS) {
    res.status(503).json({ message: 'Too many live monitoring connections. Use polling instead.' })
    return
  }

  activeStreams += 1
  const intervalMs = resolveInterval(req.query.intervalMs)
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  })

  let closed = false
  const send = async () => {
    if (closed) return
    try {
      const payload = await buildMonitoringSnapshot()
      if (!closed) res.write(`event: snapshot\ndata: ${JSON.stringify({ ...payload, intervalMs })}\n\n`)
    } catch {
      // A failed build sends no snapshot, so the client's stale-data rule shows Unknown.
      if (!closed) res.write(`event: error\ndata: {}\n\n`)
    }
  }

  await send()
  const timer = setInterval(() => void send(), intervalMs)
  const heartbeat = setInterval(() => {
    if (!closed) res.write(': heartbeat\n\n')
  }, 25_000)

  req.on('close', () => {
    closed = true
    clearInterval(timer)
    clearInterval(heartbeat)
    activeStreams -= 1
  })
}

export const monitoringController = {
  snapshot,
  stream: asyncHandler(stream),
}
