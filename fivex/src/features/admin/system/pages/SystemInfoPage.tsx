import { MonitoringSectionView } from '../components/MonitoringSectionView'

export function SystemInfoPage() {
  return (
    <MonitoringSectionView
      sectionId="infrastructure"
      title="Infrastructure"
      purpose="Application instances, server availability, CPU, memory, uptime."
    />
  )
}
