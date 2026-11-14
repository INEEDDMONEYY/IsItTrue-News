import { HomepageManagementSection } from '../components/homepage/HomepageManagementSection'
import { CmsBreadcrumb } from '../components/shared/CmsBreadcrumb'

export function HomepageManagementPage() {
  return (
    <div className="space-y-6">
      <CmsBreadcrumb current="Homepage" />
      <header>
        <h1 className="text-2xl font-semibold text-heading">
          Homepage Management
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Control the stories, sections, and announcements displayed on the IITNews homepage.
        </p>
      </header>

      <HomepageManagementSection />
    </div>
  )
}
