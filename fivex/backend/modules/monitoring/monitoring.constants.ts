// Polling/SSE interval bounds in milliseconds. The server enforces the minimum so a client cannot
// turn the monitoring endpoints into a load source against the API.
export const MONITORING_DEFAULT_INTERVAL_MS = 30_000
export const MONITORING_MIN_INTERVAL_MS = 10_000
export const MONITORING_MAX_INTERVAL_MS = 300_000

// Limits on live SSE connections so monitoring streams cannot exhaust the process.
export const MONITORING_MAX_STREAMS = 20

// Rolling window used for request metrics and recent error counts.
export const MONITORING_WINDOW_MS = 5 * 60_000
export const MONITORING_MAX_REQUEST_SAMPLES = 5_000
export const MONITORING_MAX_ERRORS = 100

// Thresholds that move a section from Operational to Degraded.
export const MONITORING_THRESHOLDS = {
  dbPingMsDegraded: 500,
  apiP95MsDegraded: 1_500,
  apiServerErrorRateDegraded: 0.05,
  heapUsageDegraded: 0.9,
  failedLoginsPerWindowDegraded: 20,
  failedLoginWindowMs: 15 * 60_000,
} as const

export const MONITORING_STATUSES = ['operational', 'degraded', 'down', 'unknown'] as const
export type MonitoringStatus = (typeof MONITORING_STATUSES)[number]

// Sections whose data source does not exist in the backend yet. They are reported as Unknown with a
// gap note instead of being inferred as healthy.
export const MONITORING_BACKEND_GAPS: { section: string; missing: string }[] = [
  { section: 'background-jobs', missing: 'No job queue or job run history is recorded.' },
  { section: 'storage-media', missing: 'No storage capacity or media processing metrics are recorded.' },
  { section: 'integrations', missing: 'No provider health checks or webhook delivery log exist.' },
  { section: 'scheduled-tasks', missing: 'No cron registry or last/next execution records exist.' },
  { section: 'incidents-alerts', missing: 'No incident or alert model exists.' },
]
