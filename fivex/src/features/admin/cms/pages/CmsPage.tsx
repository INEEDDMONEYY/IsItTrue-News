import { CategoriesSection } from '../components/CategoriesSection'
import { ArticleEngagementSection } from '../components/ArticleEngagementSection'

export function CmsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-heading mb-1">CMS</h1>
      <p className="text-sm text-text-muted mb-6">
        Manage the site's categories and the engagement shown on published articles.
      </p>

      <CategoriesSection />
      <ArticleEngagementSection />
    </div>
  )
}
