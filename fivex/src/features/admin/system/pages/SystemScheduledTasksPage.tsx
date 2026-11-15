import { MonitoringSectionView } from '../components/MonitoringSectionView'

export function SystemScheduledTasksPage() {
  return (
    <MonitoringSectionView
      sectionId="scheduled-tasks"
      title="Scheduled Tasks"
      purpose="Cron jobs, recurring processes, last execution, next execution."
    />
  )
}
