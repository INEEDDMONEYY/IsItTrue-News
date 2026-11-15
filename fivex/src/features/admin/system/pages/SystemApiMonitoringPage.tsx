import { MonitoringSectionView } from '../components/MonitoringSectionView'

export function SystemApiMonitoringPage() {
  return (
    <MonitoringSectionView
      sectionId="api"
      title="API Monitoring"
      purpose="Endpoint availability, latency, request volume, error rates."
    />
  )
}
