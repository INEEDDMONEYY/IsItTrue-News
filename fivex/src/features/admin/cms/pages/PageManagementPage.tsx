import { PageManagementSection } from '../components/page-management/PageManagementSection'
import { CmsBreadcrumb } from '../components/shared/CmsBreadcrumb'

export function PageManagementPage() {
  return (
    <div className="space-y-6">
      <CmsBreadcrumb current="Page Management" />
      <header>
        <h1 className="text-2xl font-semibold text-heading">
          Page Management
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Manage static website pages, publication status, revisions, and page metadata.
        </p>
      </header>

      <PageManagementSection />
    </div>
  )
}
