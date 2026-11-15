import { MonitoringSectionView } from '../components/MonitoringSectionView'

export function SystemIncidentsAlertsPage() {
  return (
    <MonitoringSectionView
      sectionId="incidents-alerts"
      title="Incidents & Alerts"
      purpose="Active incidents, severity, acknowledgements, resolutions."
    />
  )
}
