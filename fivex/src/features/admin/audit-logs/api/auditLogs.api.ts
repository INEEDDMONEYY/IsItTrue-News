
import type {
  AuditLogActor,
  AuditLogCategory,
  AuditLogEvent,
  AuditLogListResponse,
  AuditLogQueryParams,
  AuditLogSummary,
} from '../types/auditLog.types'

// Set to false when connecting the real backend.
const USE_MOCK_DATA = false

const API_BASE_URL = '/api/admin/audit-logs'

const daysAgo = (days: number, hours = 0) => {
  const date = new Date()
  date.setDate(date.getDate() - days)
  date.setHours(date.getHours() - hours)
  return date.toISOString()
}

const actors: Record<string, AuditLogActor> = {
  admin: {
    id: 'user-admin-001',
    name: 'Adonis Hines',
    email: 'adonis@isittrue.com',
    role: 'Super Administrator',
    type: 'admin',
  },
  editor: {
    id: 'user-editor-001',
    name: 'Sarah Mitchell',
    email: 'sarah@isittrue.com',
    role: 'Managing Editor',
    type: 'editor',
  },
  editorTwo: {
    id: 'user-editor-002',
    name: 'James Carter',
    email: 'james@isittrue.com',
    role: 'Senior Editor',
    type: 'editor',
  },
  author: {
    id: 'user-author-001',
    name: 'Michael Brooks',
    email: 'michael@isittrue.com',
    role: 'Author',
    type: 'author',
  },
  system: {
    id: 'system',
    name: 'System',
    email: 'system@isittrue.com',
    role: 'Automated Process',
    type: 'system',
  },
}

const mockAuditLogs: AuditLogEvent[] = [
  {
    id: 'audit-1001',
    eventType: 'article.published',
    action: 'Published article',
    description: 'Published an article after editorial review.',
    category: 'articles',
    severity: 'info',
    outcome: 'success',
    actor: actors.editor,
    resource: {
      id: 'article-4821',
      type: 'Article',
      title: 'The Changing Landscape of Digital Privacy',
    },
    changes: [
      {
        field: 'status',
        label: 'Publication status',
        before: 'Under review',
        after: 'Published',
      },
    ],
    ipAddress: '192.0.2.41',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/157.0',
    location: 'Denver, Colorado, US',
    requestId: 'req-a1001',
    createdAt: daysAgo(0, 1),
  },
  {
    id: 'audit-1002',
    eventType: 'user.role_updated',
    action: 'Updated user role',
    description: 'Changed a user account from Author to Editor.',
    category: 'roles',
    severity: 'warning',
    outcome: 'success',
    actor: actors.admin,
    resource: {
      id: 'user-2048',
      type: 'User',
      title: 'Taylor Reed',
    },
    changes: [
      {
        field: 'role',
        label: 'Account role',
        before: 'Author',
        after: 'Editor',
      },
    ],
    ipAddress: '192.0.2.15',
    location: 'Aurora, Colorado, US',
    requestId: 'req-a1002',
    createdAt: daysAgo(0, 2),
  },
  {
    id: 'audit-1003',
    eventType: 'auth.login_failed',
    action: 'Failed login attempt',
    description: 'A login attempt failed because the supplied credentials were invalid.',
    category: 'authentication',
    severity: 'warning',
    outcome: 'failure',
    actor: {
      id: 'unknown-user',
      name: 'Unknown user',
      email: 'unknown@example.com',
      role: 'Unauthenticated',
      type: 'system',
    },
    ipAddress: '198.51.100.23',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) Firefox/132.0',
    location: 'Unknown location',
    requestId: 'req-a1003',
    metadata: {
      reason: 'Invalid credentials',
      attemptNumber: 3,
    },
    createdAt: daysAgo(0, 3),
  },
  {
    id: 'audit-1004',
    eventType: 'fact_check.verdict_updated',
    action: 'Updated fact-check verdict',
    description: 'Changed the final assessment after reviewing additional evidence.',
    category: 'fact-checks',
    severity: 'warning',
    outcome: 'success',
    actor: actors.editorTwo,
    resource: {
      id: 'factcheck-0912',
      type: 'Fact Check',
      title: 'Claim about national employment figures',
    },
    changes: [
      {
        field: 'verdict',
        label: 'Final verdict',
        before: 'Unverified',
        after: 'Mostly True',
      },
    ],
    ipAddress: '192.0.2.52',
    location: 'Chicago, Illinois, US',
    requestId: 'req-a1004',
    createdAt: daysAgo(0, 5),
  },
  {
    id: 'audit-1005',
    eventType: 'evidence.access_denied',
    action: 'Evidence access blocked',
    description: 'A user attempted to access a restricted evidence record.',
    category: 'evidence',
    severity: 'critical',
    outcome: 'blocked',
    actor: actors.author,
    resource: {
      id: 'evidence-771',
      type: 'Evidence',
      title: 'Confidential source document',
    },
    ipAddress: '203.0.113.12',
    location: 'New York, New York, US',
    requestId: 'req-a1005',
    metadata: {
      reason: 'Insufficient permissions',
      requiredPermission: 'evidence.view_restricted',
    },
    createdAt: daysAgo(0, 7),
  },
  {
    id: 'audit-1006',
    eventType: 'user.suspended',
    action: 'Suspended user account',
    description: 'Suspended an account following a moderation investigation.',
    category: 'users',
    severity: 'critical',
    outcome: 'success',
    actor: actors.admin,
    resource: {
      id: 'user-3091',
      type: 'User',
      title: 'Alex Morgan',
    },
    changes: [
      {
        field: 'status',
        label: 'Account status',
        before: 'Active',
        after: 'Suspended',
      },
    ],
    ipAddress: '192.0.2.15',
    location: 'Aurora, Colorado, US',
    requestId: 'req-a1006',
    metadata: {
      reason: 'Repeated community guideline violations',
    },
    createdAt: daysAgo(0, 9),
  },
  {
    id: 'audit-1007',
    eventType: 'investigation.updated',
    action: 'Updated investigation',
    description: 'Changed the investigation status and assigned an editor.',
    category: 'investigations',
    severity: 'info',
    outcome: 'success',
    actor: actors.editor,
    resource: {
      id: 'investigation-018',
      type: 'Investigation',
      title: 'Public infrastructure spending review',
    },
    changes: [
      {
        field: 'status',
        label: 'Investigation status',
        before: 'Open',
        after: 'In progress',
      },
      {
        field: 'assignedEditor',
        label: 'Assigned editor',
        before: 'Unassigned',
        after: 'Sarah Mitchell',
      },
    ],
    ipAddress: '192.0.2.41',
    requestId: 'req-a1007',
    createdAt: daysAgo(1, 2),
  },
  {
    id: 'audit-1008',
    eventType: 'settings.updated',
    action: 'Changed platform settings',
    description: 'Updated the platform comment moderation settings.',
    category: 'settings',
    severity: 'warning',
    outcome: 'success',
    actor: actors.admin,
    resource: {
      id: 'setting-comments',
      type: 'Platform Setting',
      title: 'Comment moderation',
    },
    changes: [
      {
        field: 'autoModeration',
        label: 'Automatic moderation',
        before: false,
        after: true,
      },
    ],
    ipAddress: '192.0.2.15',
    requestId: 'req-a1008',
    createdAt: daysAgo(1, 5),
  },
  {
    id: 'audit-1009',
    eventType: 'newsletter.campaign_sent',
    action: 'Sent newsletter campaign',
    description: 'Successfully sent a scheduled newsletter campaign.',
    category: 'newsletter',
    severity: 'info',
    outcome: 'success',
    actor: actors.editorTwo,
    resource: {
      id: 'campaign-112',
      type: 'Newsletter Campaign',
      title: 'The Weekly Truth Brief — November 12',
    },
    ipAddress: '192.0.2.52',
    requestId: 'req-a1009',
    metadata: {
      recipients: 4821,
      campaignStatus: 'Sent',
    },
    createdAt: daysAgo(1, 8),
  },
  {
    id: 'audit-1010',
    eventType: 'auth.login',
    action: 'Administrator login',
    description: 'Administrator successfully authenticated.',
    category: 'authentication',
    severity: 'info',
    outcome: 'success',
    actor: actors.admin,
    ipAddress: '192.0.2.15',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/157.0',
    location: 'Aurora, Colorado, US',
    requestId: 'req-a1010',
    createdAt: daysAgo(1, 10),
  },
  {
    id: 'audit-1011',
    eventType: 'source.verified',
    action: 'Verified information source',
    description: 'Marked a source as verified after editorial review.',
    category: 'sources',
    severity: 'info',
    outcome: 'success',
    actor: actors.editor,
    resource: {
      id: 'source-220',
      type: 'Source',
      title: 'National Statistics Research Archive',
    },
    changes: [
      {
        field: 'verificationStatus',
        label: 'Verification status',
        before: 'Pending',
        after: 'Verified',
      },
    ],
    ipAddress: '192.0.2.41',
    requestId: 'req-a1011',
    createdAt: daysAgo(2, 1),
  },
  {
    id: 'audit-1012',
    eventType: 'advertisement.created',
    action: 'Created advertisement',
    description: 'Created a new advertiser placement.',
    category: 'advertisements',
    severity: 'info',
    outcome: 'success',
    actor: actors.admin,
    resource: {
      id: 'ad-551',
      type: 'Advertisement',
      title: 'Homepage Header Placement',
    },
    ipAddress: '192.0.2.15',
    requestId: 'req-a1012',
    createdAt: daysAgo(2, 4),
  },
  {
    id: 'audit-1013',
    eventType: 'case_file.reviewed',
    action: 'Reviewed case file',
    description: 'Completed a review of the submitted case file.',
    category: 'case-files',
    severity: 'info',
    outcome: 'success',
    actor: actors.editorTwo,
    resource: {
      id: 'case-441',
      type: 'Case File',
      title: 'Regional water quality investigation',
    },
    changes: [
      {
        field: 'reviewStatus',
        label: 'Review status',
        before: 'Pending',
        after: 'Approved',
      },
    ],
    ipAddress: '192.0.2.52',
    requestId: 'req-a1013',
    createdAt: daysAgo(2, 8),
  },
  {
    id: 'audit-1014',
    eventType: 'auth.password_reset',
    action: 'Password reset requested',
    description: 'A password reset request was initiated.',
    category: 'authentication',
    severity: 'warning',
    outcome: 'success',
    actor: {
      id: 'user-2048',
      name: 'Taylor Reed',
      email: 'taylor@example.com',
      role: 'Editor',
      type: 'editor',
    },
    ipAddress: '198.51.100.31',
    location: 'Austin, Texas, US',
    requestId: 'req-a1014',
    createdAt: daysAgo(3, 2),
  },
  {
    id: 'audit-1015',
    eventType: 'article.deleted',
    action: 'Article removal blocked',
    description: 'An article deletion was rejected because the account lacked permission.',
    category: 'articles',
    severity: 'critical',
    outcome: 'blocked',
    actor: actors.author,
    resource: {
      id: 'article-3301',
      type: 'Article',
      title: 'Regional election analysis',
    },
    ipAddress: '203.0.113.12',
    requestId: 'req-a1015',
    metadata: {
      reason: 'Permission denied',
      requiredPermission: 'articles.delete',
    },
    createdAt: daysAgo(3, 6),
  },
  {
    id: 'audit-1016',
    eventType: 'role.permission_updated',
    action: 'Updated role permissions',
    description: 'Added source verification access to the Senior Editor role.',
    category: 'roles',
    severity: 'warning',
    outcome: 'success',
    actor: actors.admin,
    resource: {
      id: 'role-senior-editor',
      type: 'Role',
      title: 'Senior Editor',
    },
    changes: [
      {
        field: 'permissions',
        label: 'Permissions',
        before: ['articles.review', 'fact-checks.review'],
        after: [
          'articles.review',
          'fact-checks.review',
          'sources.verify',
        ],
      },
    ],
    ipAddress: '192.0.2.15',
    requestId: 'req-a1016',
    createdAt: daysAgo(4, 1),
  },
  {
    id: 'audit-1017',
    eventType: 'fact_check.created',
    action: 'Created fact-check record',
    description: 'A new claim was submitted for fact-check verification.',
    category: 'fact-checks',
    severity: 'info',
    outcome: 'success',
    actor: actors.author,
    resource: {
      id: 'factcheck-0920',
      type: 'Fact Check',
      title: 'Claim about public transportation funding',
    },
    ipAddress: '198.51.100.42',
    requestId: 'req-a1017',
    createdAt: daysAgo(5, 2),
  },
  {
    id: 'audit-1018',
    eventType: 'system.backup_failed',
    action: 'Scheduled backup failed',
    description: 'The scheduled database backup did not complete successfully.',
    category: 'system',
    severity: 'critical',
    outcome: 'failure',
    actor: actors.system,
    resource: {
      id: 'backup-2026-11-08',
      type: 'System Backup',
      title: 'Daily database backup',
    },
    requestId: 'req-a1018',
    metadata: {
      reason: 'Storage service timeout',
      retryScheduled: true,
    },
    createdAt: daysAgo(5, 8),
  },
  {
    id: 'audit-1019',
    eventType: 'user.created',
    action: 'Created user account',
    description: 'An administrator manually created a user account.',
    category: 'users',
    severity: 'info',
    outcome: 'success',
    actor: actors.admin,
    resource: {
      id: 'user-4102',
      type: 'User',
      title: 'Morgan Ellis',
    },
    changes: [
      {
        field: 'status',
        label: 'Account status',
        before: null,
        after: 'Active',
      },
    ],
    ipAddress: '192.0.2.15',
    requestId: 'req-a1019',
    createdAt: daysAgo(6, 3),
  },
  {
    id: 'audit-1020',
    eventType: 'advertisement.updated',
    action: 'Updated advertisement placement',
    description: 'Changed the end date of an active advertisement placement.',
    category: 'advertisements',
    severity: 'info',
    outcome: 'success',
    actor: actors.admin,
    resource: {
      id: 'ad-519',
      type: 'Advertisement',
      title: 'Selected Page Placement',
    },
    changes: [
      {
        field: 'endDate',
        label: 'End date',
        before: '2026-11-15',
        after: '2026-11-30',
      },
    ],
    ipAddress: '192.0.2.15',
    requestId: 'req-a1020',
    createdAt: daysAgo(7, 1),
  },
  {
    id: 'audit-1021',
    eventType: 'investigation.access_denied',
    action: 'Restricted investigation access',
    description: 'An access request was blocked due to investigation restrictions.',
    category: 'investigations',
    severity: 'warning',
    outcome: 'blocked',
    actor: actors.author,
    resource: {
      id: 'investigation-025',
      type: 'Investigation',
      title: 'Confidential procurement investigation',
    },
    ipAddress: '198.51.100.42',
    requestId: 'req-a1021',
    createdAt: daysAgo(8, 3),
  },
  {
    id: 'audit-1022',
    eventType: 'settings.updated',
    action: 'Updated SEO configuration',
    description: 'Changed the default metadata description for the publication.',
    category: 'settings',
    severity: 'info',
    outcome: 'success',
    actor: actors.admin,
    resource: {
      id: 'setting-seo-defaults',
      type: 'Platform Setting',
      title: 'Default SEO metadata',
    },
    changes: [
      {
        field: 'description',
        label: 'Default description',
        before: 'Independent news and reporting.',
        after: 'Investigative journalism built on evidence and transparency.',
      },
    ],
    ipAddress: '192.0.2.15',
    requestId: 'req-a1022',
    createdAt: daysAgo(9, 2),
  },
  {
    id: 'audit-1023',
    eventType: 'evidence.uploaded',
    action: 'Uploaded evidence file',
    description: 'An editor uploaded a supporting document to an investigation.',
    category: 'evidence',
    severity: 'info',
    outcome: 'success',
    actor: actors.editor,
    resource: {
      id: 'evidence-812',
      type: 'Evidence',
      title: 'Public records request response.pdf',
    },
    ipAddress: '192.0.2.41',
    requestId: 'req-a1023',
    metadata: {
      fileType: 'application/pdf',
      fileSize: '2.4 MB',
    },
    createdAt: daysAgo(10, 1),
  },
  {
    id: 'audit-1024',
    eventType: 'newsletter.subscriber_exported',
    action: 'Exported subscriber list',
    description: 'An administrator exported newsletter subscriber records.',
    category: 'newsletter',
    severity: 'warning',
    outcome: 'success',
    actor: actors.admin,
    resource: {
      id: 'subscriber-export-101',
      type: 'Subscriber Export',
      title: 'November subscriber export',
    },
    ipAddress: '192.0.2.15',
    requestId: 'req-a1024',
    metadata: {
      exportedRecords: 4821,
      format: 'CSV',
    },
    createdAt: daysAgo(11, 4),
  },
  {
    id: 'audit-1025',
    eventType: 'auth.mfa_failed',
    action: 'Multi-factor authentication failed',
    description: 'A user did not complete the required multi-factor authentication challenge.',
    category: 'authentication',
    severity: 'critical',
    outcome: 'failure',
    actor: {
      id: 'user-unknown-2',
      name: 'Unknown user',
      email: 'unavailable',
      role: 'Unauthenticated',
      type: 'system',
    },
    ipAddress: '203.0.113.78',
    location: 'Unknown location',
    requestId: 'req-a1025',
    metadata: {
      reason: 'Invalid verification code',
    },
    createdAt: daysAgo(12, 2),
  },
  {
    id: 'audit-1026',
    eventType: 'source.updated',
    action: 'Updated source information',
    description: 'Updated the attribution and reference details for a source.',
    category: 'sources',
    severity: 'info',
    outcome: 'success',
    actor: actors.editorTwo,
    resource: {
      id: 'source-224',
      type: 'Source',
      title: 'Municipal public records database',
    },
    changes: [
      {
        field: 'attribution',
        label: 'Attribution',
        before: 'Municipal records',
        after: 'City public records archive',
      },
    ],
    ipAddress: '192.0.2.52',
    requestId: 'req-a1026',
    createdAt: daysAgo(13, 1),
  },
  {
    id: 'audit-1027',
    eventType: 'case_file.rejected',
    action: 'Rejected case file',
    description: 'A submitted case file was returned for additional documentation.',
    category: 'case-files',
    severity: 'warning',
    outcome: 'success',
    actor: actors.editor,
    resource: {
      id: 'case-452',
      type: 'Case File',
      title: 'Local environmental impact report',
    },
    changes: [
      {
        field: 'status',
        label: 'Review status',
        before: 'Pending',
        after: 'Changes requested',
      },
    ],
    ipAddress: '192.0.2.41',
    requestId: 'req-a1027',
    createdAt: daysAgo(14, 3),
  },
  {
    id: 'audit-1028',
    eventType: 'article.updated',
    action: 'Updated article content',
    description: 'Edited an article headline and summary during editorial review.',
    category: 'articles',
    severity: 'info',
    outcome: 'success',
    actor: actors.editorTwo,
    resource: {
      id: 'article-4900',
      type: 'Article',
      title: 'Understanding the New Data Protection Rules',
    },
    changes: [
      {
        field: 'headline',
        label: 'Headline',
        before: 'New Data Rules Explained',
        after: 'Understanding the New Data Protection Rules',
      },
    ],
    ipAddress: '192.0.2.52',
    requestId: 'req-a1028',
    createdAt: daysAgo(15, 2),
  },
]

// Clone records before returning them to consumers.
const cloneLogs = (logs: AuditLogEvent[]): AuditLogEvent[] =>
  logs.map((log) => ({
    ...log,
    actor: { ...log.actor },
    resource: log.resource ? { ...log.resource } : undefined,
    changes: log.changes?.map((change) => ({
      ...change,
      before: structuredClone(change.before),
      after: structuredClone(change.after),
    })),
    metadata: log.metadata ? structuredClone(log.metadata) : undefined,
  }))

const matchesCategory = (
  log: AuditLogEvent,
  category: AuditLogCategory | 'all',
) => category === 'all' || log.category === category

const matchesDateRange = (
  log: AuditLogEvent,
  startDate: string,
  endDate: string,
) => {
  const timestamp = new Date(log.createdAt).getTime()

  if (Number.isNaN(timestamp)) return false

  if (startDate) {
    const start = new Date(`${startDate}T00:00:00`).getTime()
    if (timestamp < start) return false
  }

  if (endDate) {
    const end = new Date(`${endDate}T23:59:59.999`).getTime()
    if (timestamp > end) return false
  }

  return true
}

const filterMockLogs = (params: AuditLogQueryParams) => {
  const query = params.search.trim().toLowerCase()

  return cloneLogs(mockAuditLogs)
    .filter((log) => {
      const searchable = [
        log.id,
        log.eventType,
        log.action,
        log.description,
        log.actor.name,
        log.actor.email,
        log.actor.role,
        log.resource?.id,
        log.resource?.title,
        log.resource?.type,
        log.ipAddress,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return (
        (!query || searchable.includes(query)) &&
        matchesCategory(log, params.category) &&
        (params.severity === 'all' || log.severity === params.severity) &&
        (params.outcome === 'all' || log.outcome === params.outcome) &&
        (!params.actorId || log.actor.id === params.actorId) &&
        matchesDateRange(log, params.startDate, params.endDate)
      )
    })
    .sort((a, b) => {
      const difference =
        new Date(a.createdAt).getTime() -
        new Date(b.createdAt).getTime()

      return params.sortOrder === 'oldest' ? difference : -difference
    })
}

const getMockSummary = (): AuditLogSummary => {
  const today = new Date().toDateString()

  return {
    totalEvents: mockAuditLogs.length,
    eventsToday: mockAuditLogs.filter(
      (log) => new Date(log.createdAt).toDateString() === today,
    ).length,
    adminActions: mockAuditLogs.filter(
      (log) => log.actor.type === 'admin',
    ).length,
    securityEvents: mockAuditLogs.filter(
      (log) =>
        log.category === 'authentication' ||
        log.severity === 'critical' ||
        log.outcome === 'blocked',
    ).length,
    failedActions: mockAuditLogs.filter(
      (log) => log.outcome === 'failure',
    ).length,
    changesSincePreviousPeriod: 12.4,
  }
}

async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(
      `Audit logs request failed (${response.status}).`,
    )
  }

  return response.json() as Promise<T>
}

export async function getAuditLogs(
  params: AuditLogQueryParams,
): Promise<AuditLogListResponse> {
  if (USE_MOCK_DATA) {
    const filtered = filterMockLogs(params)
    const total = filtered.length
    const totalPages = Math.ceil(total / params.pageSize)
    const start = (params.page - 1) * params.pageSize

    return {
      data: filtered.slice(start, start + params.pageSize),
      pagination: {
        page: params.page,
        pageSize: params.pageSize,
        total,
        totalPages,
      },
    }
  }

  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== '' && value !== 'all') {
      searchParams.set(key, String(value))
    }
  })

  return request<AuditLogListResponse>(
    `${API_BASE_URL}?${searchParams.toString()}`,
  )
}

export async function getAuditLogById(
  id: string,
): Promise<AuditLogEvent | null> {
  if (USE_MOCK_DATA) {
    const log = mockAuditLogs.find((item) => item.id === id)
    return log ? cloneLogs([log])[0] : null
  }

  const response = await fetch(`${API_BASE_URL}/${encodeURIComponent(id)}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  })

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error(`Audit logs request failed (${response.status}).`)
  }

  return response.json() as Promise<AuditLogEvent>
}

export async function getAuditLogSummary(): Promise<AuditLogSummary> {
  if (USE_MOCK_DATA) {
    return getMockSummary()
  }

  return request<AuditLogSummary>(`${API_BASE_URL}/summary`)
}

export async function getAuditLogActors(): Promise<AuditLogActor[]> {
  if (USE_MOCK_DATA) {
    const uniqueActors = new Map<string, AuditLogActor>()

    mockAuditLogs.forEach((event) => {
      uniqueActors.set(event.actor.id, { ...event.actor })
    })

    return Array.from(uniqueActors.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    )
  }

  return request<AuditLogActor[]>(`${API_BASE_URL}/actors`)
}
