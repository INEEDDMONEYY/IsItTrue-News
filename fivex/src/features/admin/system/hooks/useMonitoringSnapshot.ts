import { useEffect, useState } from 'react'
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
