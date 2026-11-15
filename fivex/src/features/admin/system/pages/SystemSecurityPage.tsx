import { MonitoringSectionView } from '../components/MonitoringSectionView'

export function SystemSecurityPage() {
  return (
    <MonitoringSectionView
      sectionId="security"
      title="Security"
      purpose="Authentication failures, suspicious activity, rate limits, access events."
    />
  )
}
