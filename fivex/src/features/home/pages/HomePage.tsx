import { FeaturedArticle } from '../components/FeaturedArticle'
import { AdSlot } from '@/features/ads/components/AdSlot'
import { CategoryChipBar } from '@/components/navigation/CategoryChipBar'
import { LatestPostsList } from '../components/LatestPostsList'
import { CategorySidebar } from '../components/CategorySidebar'
import { ArticleCard } from '../components/ArticleCard'
import { VideoSection } from '../components/VideoSection'
import { useCategories } from '@/features/categories/hooks/useCategories'
import { usePagination } from '@/hooks/usePagination'
import { Pagination } from '@/components/ui/Pagination'
import { useLatestPosts } from '../hooks/useLatestPosts'
import { useFeaturedArticle } from '../hooks/useFeaturedArticle'
import { useTrendingArticles } from '../hooks/useTrendingArticles'
import { useHomeVideos } from '../hooks/useHomeVideos'

const PAGE_SIZE = 6

export function HomePage() {
  const { categories } = useCategories()
  const latestPosts = useLatestPosts()
  const featured = useFeaturedArticle()
  const trending = useTrendingArticles()
  const homeVideos = useHomeVideos()
  const { page, setPage, totalPages, paginatedItems } = usePagination(
    trending.articles,
    PAGE_SIZE,
  )

  return (
    <div className="py-6 md:py-10 flex flex-col gap-10">
      <div className="md:hidden">
        <CategoryChipBar />
      </div>

      <AdSlot placement="header" />

      <section className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {featured.article && <FeaturedArticle article={featured.article} />}
        <div className="flex flex-col gap-6">
          {/* Sits above the list so new posts push the list down, never the ad. */}
          <AdSlot placement="sidepage" />
          <LatestPostsList
            articles={latestPosts.articles}
            isLoading={latestPosts.isLoading}
            isError={latestPosts.isError}
          />
        </div>
      </section>

      <VideoSection videos={homeVideos.videos} />

      <AdSlot placement="selected_page" page="home" layout="split" />

      <section className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        <div className="hidden lg:block">
          <CategorySidebar categories={categories} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-heading">
              Trending Stories
            </h3>
          </div>

          {!trending.isLoading && trending.articles.length === 0 && (
            <p className="text-sm text-text-muted">No trending stories yet.</p>
          )}

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
