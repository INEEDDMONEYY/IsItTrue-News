import { MonitoringSectionView } from '../components/MonitoringSectionView'

export function SystemDeploymentsPage() {
  return (
    <MonitoringSectionView
      sectionId="deployments"
      title="Deployments & Versions"
      purpose="Application versions, deployment history, build status."
    />
  )
}
