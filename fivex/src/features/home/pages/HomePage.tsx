import { useState } from 'react'
import { FeaturedArticle } from '../components/FeaturedArticle'
import { LatestPostsList } from '../components/LatestPostsList'
import { CategorySidebar } from '../components/CategorySidebar'
import { ArticleCard } from '../components/ArticleCard'
import { VideoSection } from '../components/VideoSection'
import { EditorsPicksCarousel } from '../components/EditorsPicksCarousel'
import {
  CATEGORIES,
  FEATURED_ARTICLE,
  LATEST_POSTS,
  TRENDING_ARTICLES,
} from '../data/mockHome'

const TOTAL_PAGES = 5

export function HomePage() {
  const [page, setPage] = useState(1)

  return (
    <div className="py-6 md:py-10 flex flex-col gap-10">
      <section className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <FeaturedArticle article={FEATURED_ARTICLE} />
        <LatestPostsList articles={LATEST_POSTS} />
      </section>

      <VideoSection />

      <EditorsPicksCarousel articles={TRENDING_ARTICLES} />

      <section className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        <CategorySidebar categories={CATEGORIES} />

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-heading">
              Trending Stories
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {TRENDING_ARTICLES.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 mt-8">
            {Array.from({ length: TOTAL_PAGES }).map((_, i) => {
              const n = i + 1
              return (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`w-8 h-8 rounded-full text-sm transition-colors ${
                    page === n
                      ? 'bg-accent text-white'
                      : 'text-text-muted hover:bg-surface-2'
                  }`}
                >
                  {n}
                </button>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}