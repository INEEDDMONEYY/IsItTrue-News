import { GlobalContentSection } from '../components/global-content/GlobalContentSection'
import { CmsBreadcrumb } from '../components/shared/CmsBreadcrumb'

export function GlobalContentPage() {
  return (
    <div className="space-y-6">
      <CmsBreadcrumb current="Global Content" />
      <header>
        <h1 className="text-2xl font-semibold text-heading">
          Global Website Content
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Manage reusable content and messaging displayed throughout the public website.
        </p>
      </header>

      <GlobalContentSection />
    </div>
  )
}
