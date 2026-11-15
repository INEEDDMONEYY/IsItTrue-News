export const AUDIT_CATEGORIES = [
  'authentication',
  'users',
  'roles',
  'articles',
  'fact-checks',
  'investigations',
  'case-files',
  'evidence',
  'sources',
  'newsletter',
  'advertisements',
  'settings',
  'system',
] as const

export type AuditCategory = (typeof AUDIT_CATEGORIES)[number]

export const AUDIT_SEVERITIES = ['info', 'warning', 'critical'] as const
export type AuditSeverity = (typeof AUDIT_SEVERITIES)[number]

export const AUDIT_OUTCOMES = ['success', 'failure', 'blocked'] as const
export type AuditOutcome = (typeof AUDIT_OUTCOMES)[number]

// 'system' is reserved for platform-generated events (jobs, deploys). Nothing emits it yet.
export const AUDIT_ACTOR_TYPES = ['admin', 'editor', 'author', 'user', 'anonymous', 'system'] as const
export type AuditActorType = (typeof AUDIT_ACTOR_TYPES)[number]

interface AuditEventDefinition {
  action: string
  category: AuditCategory
  severity: AuditSeverity
}

// Only events the backend actually records. Add an entry when wiring a new write path.
export const AUDIT_EVENTS = {
  'auth.login': { action: 'Signed in', category: 'authentication', severity: 'info' },
  'auth.login_failed': { action: 'Failed sign-in', category: 'authentication', severity: 'warning' },
  'auth.logout': { action: 'Signed out', category: 'authentication', severity: 'info' },
  'auth.email_verified': { action: 'Email verified', category: 'authentication', severity: 'info' },
  'auth.password_reset': { action: 'Password reset', category: 'authentication', severity: 'warning' },
  'auth.password_changed': { action: 'Password changed', category: 'authentication', severity: 'warning' },
  'auth.email_changed': { action: 'Email changed', category: 'authentication', severity: 'warning' },
  'user.created': { action: 'Account created', category: 'users', severity: 'info' },
  'user.deleted': { action: 'Account deleted', category: 'users', severity: 'critical' },
  'user.self_deleted': { action: 'Account deleted by owner', category: 'users', severity: 'warning' },
  'role.changed': { action: 'Role changed', category: 'roles', severity: 'warning' },
  'role.admin_granted': { action: 'Admin access granted', category: 'roles', severity: 'critical' },
  'role.admin_revoked': { action: 'Admin access revoked', category: 'roles', severity: 'critical' },
  'advertisement.campaign_approved': { action: 'Campaign approved', category: 'advertisements', severity: 'info' },
  'advertisement.campaign_rejected': { action: 'Campaign rejected', category: 'advertisements', severity: 'warning' },
  'advertisement.advertiser_status_changed': {
    action: 'Advertiser status changed',
    category: 'advertisements',
    severity: 'warning',
  },
  'advertisement.promo_code_created': { action: 'Promotional code created', category: 'advertisements', severity: 'info' },
  'advertisement.promo_code_updated': { action: 'Promotional code updated', category: 'advertisements', severity: 'info' },
  'advertisement.promo_code_deleted': { action: 'Promotional code deleted', category: 'advertisements', severity: 'warning' },
  'article.status_changed': { action: 'Article status changed', category: 'articles', severity: 'info' },
  'article.published': { action: 'Article published', category: 'articles', severity: 'info' },
  'article.unpublished': { action: 'Article unpublished', category: 'articles', severity: 'warning' },
  'article.deleted': { action: 'Article deleted', category: 'articles', severity: 'critical' },
  'fact_check.request_submitted': { action: 'Fact-check requested', category: 'fact-checks', severity: 'info' },
  'fact_check.request_approved': { action: 'Fact-check request approved', category: 'fact-checks', severity: 'info' },
  'fact_check.request_rejected': { action: 'Fact-check request rejected', category: 'fact-checks', severity: 'warning' },
  'fact_check.reviewer_assigned': { action: 'Reviewer assigned', category: 'fact-checks', severity: 'info' },
  'fact_check.reviewer_removed': { action: 'Reviewer removed', category: 'fact-checks', severity: 'info' },
  'fact_check.returned_for_review': { action: 'Returned for review', category: 'fact-checks', severity: 'info' },
  'fact_check.escalated': { action: 'Escalated', category: 'fact-checks', severity: 'warning' },
  'fact_check.escalation_resolved': { action: 'Escalation resolved', category: 'fact-checks', severity: 'info' },
  'fact_check.verdict_revised': { action: 'Conclusion revised', category: 'fact-checks', severity: 'warning' },
  'fact_check.metadata_updated': { action: 'Record details updated', category: 'fact-checks', severity: 'info' },
  'fact_check.comment_added': { action: 'Comment added', category: 'fact-checks', severity: 'info' },
  'fact_check.investigation_linked': { action: 'Investigation link changed', category: 'investigations', severity: 'info' },
  'evidence.flagged': { action: 'Evidence flagged as incomplete', category: 'evidence', severity: 'warning' },
  'evidence.flag_cleared': { action: 'Evidence flag cleared', category: 'evidence', severity: 'info' },
  'evidence.restriction_changed': { action: 'Evidence access changed', category: 'evidence', severity: 'warning' },
} as const satisfies Record<string, AuditEventDefinition>

export type AuditEventType = keyof typeof AUDIT_EVENTS
