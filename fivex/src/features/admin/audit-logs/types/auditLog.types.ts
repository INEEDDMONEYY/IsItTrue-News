
export type AuditLogCategory =
  | 'authentication'
  | 'users'
  | 'roles'
  | 'articles'
  | 'fact-checks'
  | 'investigations'
  | 'case-files'
  | 'evidence'
  | 'sources'
  | 'newsletter'
  | 'advertisements'
  | 'settings'
  | 'system'

export type AuditLogSeverity = 'info' | 'warning' | 'critical'

export type AuditLogOutcome = 'success' | 'failure' | 'blocked'

export type AuditLogActorType = 'admin' | 'editor' | 'author' | 'user' | 'anonymous' | 'system'

export interface AuditLogActor {
  id: string
  name: string
  email: string
  role: string
  type: AuditLogActorType
  avatarUrl?: string
}

export interface AuditLogResource {
  id: string
  type: string
  title: string
  url?: string
}

export interface AuditLogChange {
  field: string
  label: string
  before: unknown
  after: unknown
}

export interface AuditLogEvent {
  id: string
  eventType: string
  action: string
  description: string
  category: AuditLogCategory
  severity: AuditLogSeverity
  outcome: AuditLogOutcome
  actor: AuditLogActor
  resource?: AuditLogResource
  changes?: AuditLogChange[]
  ipAddress?: string
  userAgent?: string
  location?: string
  requestId?: string
  metadata?: Record<string, unknown>
  createdAt: string
}

export interface AuditLogFilters {
  search: string
  category: AuditLogCategory | 'all'
  severity: AuditLogSeverity | 'all'
  outcome: AuditLogOutcome | 'all'
  actorId: string
  startDate: string
  endDate: string
  sortOrder: 'newest' | 'oldest'
}

export interface AuditLogPagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface AuditLogSummary {
  totalEvents: number
  eventsToday: number
  adminActions: number
  securityEvents: number
  failedActions: number
  changesSincePreviousPeriod: number
}

export interface AuditLogListResponse {
  data: AuditLogEvent[]
  pagination: AuditLogPagination
}

export interface AuditLogQueryParams extends AuditLogFilters {
  page: number
  pageSize: number
}

export interface AuditLogApiError {
  message: string
  status?: number
}
