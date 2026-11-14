import { ArticlePresentationSection } from '../components/article-presentation/ArticlePresentationSection'
import { CmsBreadcrumb } from '../components/shared/CmsBreadcrumb'

export function ArticlePresentationPage() {
  return (
    <div className="space-y-6">
      <CmsBreadcrumb current="Article Presentation" />
      <header>
        <h1 className="text-2xl font-semibold text-heading">
          Article Presentation
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Control how published articles are displayed and recommended across IITNews.
        </p>
      </header>

      <ArticlePresentationSection />
    </div>
  )
}
