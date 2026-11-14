import { ArticleEngagementSection } from '../components/ArticleEngagementSection'
import { CmsBreadcrumb } from '../components/shared/CmsBreadcrumb'

export function DeveloperToolsPage() {
  return (
    <div className="space-y-6">
      <CmsBreadcrumb current="Developer Tools" />
      <header>
        <h1 className="text-2xl font-semibold text-heading">
          Developer Tools
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Development and testing utilities for IITNews.
        </p>
      </header>

      <ArticleEngagementSection />
    </div>
  )
}
