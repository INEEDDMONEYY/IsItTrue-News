export interface SystemSectionLink {
  label: string
  to: string
}

export const SYSTEM_SECTION_LINKS: SystemSectionLink[] = [
  { label: 'Overview', to: '/admin/system/overview' },
  { label: 'Infrastructure', to: '/admin/system/infrastructure' },
  { label: 'Database', to: '/admin/system/database' },
  { label: 'API Monitoring', to: '/admin/system/api-monitoring' },
  { label: 'Background Jobs & Queues', to: '/admin/system/background-jobs' },
  { label: 'Storage & Media', to: '/admin/system/storage-media' },
  { label: 'Email & Notifications', to: '/admin/system/email-notifications' },
  { label: 'Performance', to: '/admin/system/performance' },
  { label: 'Errors & Logs', to: '/admin/system/errors-logs' },
  { label: 'Security', to: '/admin/system/security' },
  { label: 'Incidents & Alerts', to: '/admin/system/incidents-alerts' },
  { label: 'Integrations', to: '/admin/system/integrations' },
  { label: 'Scheduled Tasks', to: '/admin/system/scheduled-tasks' },
  { label: 'Audit & Events', to: '/admin/system/audit-events' },
  { label: 'Deployments & Versions', to: '/admin/system/deployments' },
]
