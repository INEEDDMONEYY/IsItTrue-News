import { MonitoringSectionView } from '../components/MonitoringSectionView'

export function SystemPerformancePage() {
  return (
    <MonitoringSectionView
      sectionId="api"
      title="Performance"
      purpose="Page and API response times, latency trends, throughput."
    />
  )
}
