import { MonitoringSectionView } from '../components/MonitoringSectionView'

export function SystemHealthPage() {
  return (
    <MonitoringSectionView
      sectionId="overview"
      title="Overview"
      purpose="Overall platform health, incidents, service availability, recent events."
    />
  )
}
