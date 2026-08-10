import { MapPin } from 'lucide-react'
import { ArticleCard } from '@/features/home/components/ArticleCard'
import { CategorySidebar } from '@/features/home/components/CategorySidebar'
import { LOCAL_ARTICLES, LOCAL_CATEGORIES, MOCK_LOCATION } from '../data/mockLocal'

export function LocalPage() {
  return (
    <div className="py-6 md:py-10 flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-accent-bg flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-heading">Local</h1>
            <p className="text-sm text-text-muted">News from around {MOCK_LOCATION}.</p>
          </div>
        </div>

        <button className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg border border-border text-heading hover:border-accent-border hover:text-accent transition-colors">
          <MapPin className="w-4 h-4" />
          Change Location
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        <CategorySidebar categories={LOCAL_CATEGORIES} />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {LOCAL_ARTICLES.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </div>
  )
}
