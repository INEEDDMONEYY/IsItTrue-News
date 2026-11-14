import { PlatformConfigurationSection } from '../components/configuration/PlatformConfigurationSection'
import { CmsBreadcrumb } from '../components/shared/CmsBreadcrumb'

export function PlatformConfigurationPage() {
  return (
    <div className="space-y-6">
      <CmsBreadcrumb current="Platform Configuration" />
      <header>
        <h1 className="text-2xl font-semibold text-heading">
          Platform Configuration
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Manage public-facing content presentation and website display preferences.
        </p>
      </header>

      <PlatformConfigurationSection />
    </div>
  )
}
