import { MonitoringSectionView } from '../components/MonitoringSectionView'

export function SystemEmailNotificationsPage() {
  return (
    <MonitoringSectionView
      sectionId="email"
      title="Email & Notifications"
      purpose="Delivery status, bounces, failures, provider availability."
    />
  )
}
