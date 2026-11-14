import { NavigationManagementSection } from '../components/navigation/NavigationManagementSection'
import { CmsBreadcrumb } from '../components/shared/CmsBreadcrumb'

export function NavigationManagementPage() {
  return (
    <div className="space-y-6">
      <CmsBreadcrumb current="Navigation" />
      <header>
        <h1 className="text-2xl font-semibold text-heading">
          Navigation Management
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Manage public-facing website navigation, menus, and footer links.
        </p>
      </header>

      <NavigationManagementSection />
    </div>
  )
}
