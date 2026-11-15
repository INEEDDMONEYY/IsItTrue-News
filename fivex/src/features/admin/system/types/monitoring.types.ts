export type MonitoringStatus = 'operational' | 'degraded' | 'down' | 'unknown'

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
