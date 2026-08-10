import { ChangeEmailSection } from '../components/ChangeEmailSection'
import { ChangePasswordSection } from '../components/ChangePasswordSection'
import { DangerZoneSection } from '../components/DangerZoneSection'
import { ProfileNameSection } from '../components/ProfileNameSection'

/**
 * Shared account settings page used by every signed-in role (reader, author,
 * editor). Admins get the fuller `/admin/settings` page instead, which reuses
 * these same sections plus admin-only account creation and platform controls.
 */
export function AccountSettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-heading mb-1">Settings</h1>
      <p className="text-sm text-text-muted mb-6">Manage your account.</p>

      <div className="flex flex-col gap-5 max-w-3xl">
        <ProfileNameSection />
        <ChangeEmailSection />
        <ChangePasswordSection />
        <DangerZoneSection />
      </div>
    </div>
  )
}
