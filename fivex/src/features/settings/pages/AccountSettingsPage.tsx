import { useAuth } from '@/app/providers/AuthProvider'
import { AuthorWorkspaceSettings } from '../components/AuthorWorkspaceSettings'
import { ChangeEmailSection } from '../components/ChangeEmailSection'
import { ChangePasswordSection } from '../components/ChangePasswordSection'
import { DangerZoneSection } from '../components/DangerZoneSection'
import { IdentityVerificationSection } from '../components/IdentityVerificationSection'
import { ProfileNameSection } from '../components/ProfileNameSection'
import { StaffProfileSection } from '../components/StaffProfileSection'

/**
 * Shared account settings page used by every signed-in role (reader, author,
 * editor). Admins get the fuller `/admin/settings` page instead, which reuses
 * these same sections plus admin-only account creation and platform controls.
 * Publishing preferences and author notifications are author-only.
 */
export function AccountSettingsPage() {
  const { user } = useAuth()
  // Editors and organizations get a fuller public profile; everyone else keeps the simple name field.
  const hasPublicProfile = user?.role === 'editor' || user?.role === 'organization'

  return (
    <div>
      <h1 className="text-2xl font-semibold text-heading mb-1">Settings</h1>
      <p className="text-sm text-text-muted mb-6">Manage your account.</p>

      <div className="flex flex-col gap-5 max-w-3xl">
        {hasPublicProfile ? <StaffProfileSection /> : <ProfileNameSection />}
        <ChangeEmailSection />
        <ChangePasswordSection />
        <IdentityVerificationSection />
        {user?.role === 'author' && <AuthorWorkspaceSettings />}
        <DangerZoneSection />
      </div>
    </div>
  )
}
