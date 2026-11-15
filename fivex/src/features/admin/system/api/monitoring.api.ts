import { apiClient } from '@/api/client'
import { API_BASE_URL } from '@/config/env'
import type { MonitoringSnapshot } from '../types/monitoring.types'

// Matches the backend routes mounted at /api/admin/monitoring.
const MONITORING_BASE = '/api/admin/monitoring'

export async function fetchMonitoringSnapshot(): Promise<MonitoringSnapshot> {
  const response = await apiClient.get<MonitoringSnapshot>(`${MONITORING_BASE}/snapshot`)
  return response.data
}

/** EventSource cannot send an Authorization header, so the stream relies on the session cookie. */
export function getMonitoringStreamUrl(intervalMs: number): string {
  return `${API_BASE_URL}${MONITORING_BASE}/stream?intervalMs=${intervalMs}`
}
