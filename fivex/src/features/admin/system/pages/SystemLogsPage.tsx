import { MonitoringSectionView } from '../components/MonitoringSectionView'

export function SystemLogsPage() {
  return (
    <MonitoringSectionView
      sectionId="errors"
      title="Errors & Logs"
      purpose="Application exceptions, frontend errors, backend errors, stack traces."
    />
  )
}
