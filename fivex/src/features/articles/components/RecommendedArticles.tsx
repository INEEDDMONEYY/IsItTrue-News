import { ArticleCard } from '@/features/home/components/ArticleCard'
import { useRecommendedArticles } from '../hooks/useRecommendedArticles'

export function RecommendedArticles({ currentArticleId }: { currentArticleId?: string }) {
  const { articles, isLoading, isError } = useRecommendedArticles(currentArticleId)

  if (isLoading || isError || articles.length === 0) return null

  return (
    <section className="flex flex-col gap-4 border-t border-border pt-8">
      <h2 className="text-lg font-semibold text-heading">Recommended for you</h2>
      <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        {articles.map((article) => (
          <div key={article.id} className="w-72 shrink-0 snap-start sm:w-80">
            <ArticleCard article={article} />
          </div>
        ))}
      </div>
    </section>
  )
}
