import { MonitoringSectionView } from '../components/MonitoringSectionView'

export function SystemDatabasePage() {
  return (
    <MonitoringSectionView
      sectionId="database"
      title="Database"
      purpose="Connection health, query performance, connection pools, storage, backups."
    />
  )
}
