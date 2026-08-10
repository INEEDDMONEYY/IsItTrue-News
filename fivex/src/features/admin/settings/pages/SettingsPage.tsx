import { ChangeEmailSection } from '@/features/settings/components/ChangeEmailSection'
import { ChangePasswordSection } from '@/features/settings/components/ChangePasswordSection'
import { DangerZoneSection } from '@/features/settings/components/DangerZoneSection'
import { ProfileNameSection } from '@/features/settings/components/ProfileNameSection'
import { CreateUserSection } from '../components/CreateUserSection'
import { PlatformSettingsSection } from '../components/PlatformSettingsSection'

export function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-heading mb-1">Settings</h1>
      <p className="text-sm text-text-muted mb-6">
        Manage your account, create new accounts, and configure the platform.
      </p>

      <div className="flex flex-col gap-5 max-w-3xl">
        <ProfileNameSection />
        <ChangeEmailSection />
        <ChangePasswordSection />
        <CreateUserSection />
        <PlatformSettingsSection />
        <DangerZoneSection />
      </div>
    </div>
  )
}
