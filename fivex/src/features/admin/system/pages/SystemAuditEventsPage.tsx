import { MonitoringSectionView } from '../components/MonitoringSectionView'

export function SystemAuditEventsPage() {
  return (
    <MonitoringSectionView
      sectionId="audit"
      title="Audit & Events"
      purpose="Administrative actions, configuration changes, system events."
    />
  )
}
