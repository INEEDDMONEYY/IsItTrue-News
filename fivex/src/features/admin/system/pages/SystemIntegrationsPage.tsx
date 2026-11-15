import { MonitoringSectionView } from '../components/MonitoringSectionView'

export function SystemIntegrationsPage() {
  return (
    <MonitoringSectionView
      sectionId="integrations"
      title="Integrations"
      purpose="External providers, webhooks, connected services, failures."
    />
  )
}
