import { MonitoringSectionView } from '../components/MonitoringSectionView'

export function SystemBackgroundJobsPage() {
  return (
    <MonitoringSectionView
      sectionId="background-jobs"
      title="Background Jobs & Queues"
      purpose="Pending jobs, failed jobs, retries, processing times, queue backlogs."
    />
  )
}
