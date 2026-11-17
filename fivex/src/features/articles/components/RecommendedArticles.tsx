import { ArticleCard } from '@/features/home/components/ArticleCard'
import { useRecommendedArticles } from '../hooks/useRecommendedArticles'

export function RecommendedArticles({ currentArticleId }: { currentArticleId?: string }) {
  const { articles, isLoading, isError } = useRecommendedArticles(currentArticleId)

  if (isLoading || isError || articles.length === 0) return null

  return (
    <section className="flex flex-col gap-4 border-t border-border pt-8">
      <h2 className="text-lg font-semibold text-heading">Recommended for you</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  )
}
