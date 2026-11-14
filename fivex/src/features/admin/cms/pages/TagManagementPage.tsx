import { TagManagementSection } from '../components/tags/TagManagementSection'
import { CmsBreadcrumb } from '../components/shared/CmsBreadcrumb'

export function TagManagementPage() {
  return (
    <div className="space-y-6">
      <CmsBreadcrumb current="Tag Management" />
      <header>
        <h1 className="text-2xl font-semibold text-heading">
          Tag Management
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Manage article tags and the classification terms used across IITNews.
        </p>
      </header>

      <TagManagementSection />
    </div>
  )
}
