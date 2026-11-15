import { Navigate } from 'react-router-dom'
import type { RouteObject } from 'react-router-dom'
import { SystemHealthPage } from './pages/SystemHealthPage'
import { SystemInfoPage } from './pages/SystemInfoPage'
import { SystemDatabasePage } from './pages/SystemDatabasePage'
import { SystemApiMonitoringPage } from './pages/SystemApiMonitoringPage'
import { SystemBackgroundJobsPage } from './pages/SystemBackgroundJobsPage'
import { SystemStorageMediaPage } from './pages/SystemStorageMediaPage'
import { SystemEmailNotificationsPage } from './pages/SystemEmailNotificationsPage'
import { SystemPerformancePage } from './pages/SystemPerformancePage'
import { SystemLogsPage } from './pages/SystemLogsPage'
import { SystemSecurityPage } from './pages/SystemSecurityPage'
import { SystemIncidentsAlertsPage } from './pages/SystemIncidentsAlertsPage'
import { SystemIntegrationsPage } from './pages/SystemIntegrationsPage'
import { SystemScheduledTasksPage } from './pages/SystemScheduledTasksPage'
import { SystemAuditEventsPage } from './pages/SystemAuditEventsPage'
import { SystemDeploymentsPage } from './pages/SystemDeploymentsPage'

export const systemRoutes: RouteObject = {
  path: 'system',
  children: [
    { index: true, element: <Navigate to="overview" replace /> },
    { path: 'overview', element: <SystemHealthPage /> },
    { path: 'infrastructure', element: <SystemInfoPage /> },
    { path: 'database', element: <SystemDatabasePage /> },
    { path: 'api-monitoring', element: <SystemApiMonitoringPage /> },
    { path: 'background-jobs', element: <SystemBackgroundJobsPage /> },
    { path: 'storage-media', element: <SystemStorageMediaPage /> },
    { path: 'email-notifications', element: <SystemEmailNotificationsPage /> },
    { path: 'performance', element: <SystemPerformancePage /> },
    { path: 'errors-logs', element: <SystemLogsPage /> },
    { path: 'security', element: <SystemSecurityPage /> },
    { path: 'incidents-alerts', element: <SystemIncidentsAlertsPage /> },
    { path: 'integrations', element: <SystemIntegrationsPage /> },
    { path: 'scheduled-tasks', element: <SystemScheduledTasksPage /> },
    { path: 'audit-events', element: <SystemAuditEventsPage /> },
    { path: 'deployments', element: <SystemDeploymentsPage /> },
  ],
}
