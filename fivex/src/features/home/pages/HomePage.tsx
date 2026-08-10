import { FeaturedArticle } from '../components/FeaturedArticle'
import { LatestPostsList } from '../components/LatestPostsList'
import { CategorySidebar } from '../components/CategorySidebar'
import { ArticleCard } from '../components/ArticleCard'
import { VideoSection } from '../components/VideoSection'
import { EditorsPicksCarousel } from '../components/EditorsPicksCarousel'
import { useCategories } from '@/features/categories/hooks/useCategories'
import { usePagination } from '@/hooks/usePagination'
import { Pagination } from '@/components/ui/Pagination'
import {
  FEATURED_ARTICLE,
  LATEST_POSTS,
  TRENDING_ARTICLES,
} from '../data/mockHome'

const PAGE_SIZE = 6

export function HomePage() {
  const { categories } = useCategories()
  const { page, setPage, totalPages, paginatedItems } = usePagination(
    TRENDING_ARTICLES,
    PAGE_SIZE,
  )

  return (
    <div className="py-6 md:py-10 flex flex-col gap-10">
      <section className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <FeaturedArticle article={FEATURED_ARTICLE} />
        <LatestPostsList articles={LATEST_POSTS} />
      </section>

      <VideoSection />

      <EditorsPicksCarousel articles={TRENDING_ARTICLES} />

      <section className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        <CategorySidebar categories={categories} />

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-heading">
              Trending Stories
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {paginatedItems.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </section>
    </div>
  )
}