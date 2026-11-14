import { CategoriesSection } from '../components/CategoriesSection'
import { CmsBreadcrumb } from '../components/shared/CmsBreadcrumb'

export function CategoriesPage() {
  return (
    <div className="space-y-6">
      <CmsBreadcrumb current="Categories" />
      <header>
        <h1 className="text-2xl font-semibold text-heading">
          Categories
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Manage article categories used throughout IITNews.
        </p>
      </header>

      <CategoriesSection />
    </div>
  )
}
