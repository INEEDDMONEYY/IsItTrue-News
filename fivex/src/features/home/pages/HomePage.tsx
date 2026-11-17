import { Link } from 'react-router-dom'
import { FeaturedArticle } from '../components/FeaturedArticle'
import { AdSlot } from '@/features/ads/components/AdSlot'
import { CategoryChipBar } from '@/components/navigation/CategoryChipBar'
import { LatestPostsList } from '../components/LatestPostsList'
import { CategoryRow } from '../components/CategoryRow'
import { VideoSection } from '../components/VideoSection'
import { useCategories } from '@/features/categories/hooks/useCategories'
import { useLatestPosts } from '../hooks/useLatestPosts'
import { useFeaturedArticle } from '../hooks/useFeaturedArticle'
import { useTrendingArticles } from '../hooks/useTrendingArticles'
import { useHomeVideos } from '../hooks/useHomeVideos'
import type { Article } from '@/shared/types/article.types'
import dayjs from '@/lib/dayjs'

const HERO_SIDE_COUNT = 2

function SideStory({ article }: { article: Article }) {
  return (
    <Link to={`/article/${article.slug}`} className="group flex flex-col gap-3">
      <div className="aspect-[4/3] rounded-lg bg-card-2 overflow-hidden">
        <img src={article.thumbnailUrl} alt={article.title} className="w-full h-full object-cover" />
      </div>
      <span className="text-[11px] uppercase tracking-wide font-semibold text-accent">
        {article.category.name}
      </span>
      <h3 className="text-sm font-semibold text-heading leading-snug group-hover:text-accent transition-colors">
        {article.title}
      </h3>
      <p className="text-xs text-text-muted">{dayjs(article.publishedAt).format('MMM D, YYYY')}</p>
    </Link>
  )
}

export function HomePage() {
  const { categories } = useCategories()
  const latestPosts = useLatestPosts()
  const featured = useFeaturedArticle()
  const trending = useTrendingArticles(HERO_SIDE_COUNT)
  const homeVideos = useHomeVideos()

  return (
    <div className="py-6 md:py-10 flex flex-col gap-10">
      <div className="md:hidden">
        <CategoryChipBar />
      </div>

      <AdSlot placement="header" />

      <section className="grid grid-cols-1 lg:grid-cols-[260px_1fr_320px] gap-6">
        <div className="flex flex-col gap-8">
          {trending.articles.slice(0, HERO_SIDE_COUNT).map((article) => (
            <SideStory key={article.id} article={article} />
          ))}
        </div>

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

      {categories.map((category) => (
        <CategoryRow key={category.id} category={category} />
      ))}

      <VideoSection videos={homeVideos.videos} />

      <AdSlot placement="selected_page" page="home" layout="split" />
    </div>
  )
}
