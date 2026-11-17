import { useTrendingArticles } from '@/features/home/hooks/useTrendingArticles'

/**
 * Recommendations for the article page. Currently trending articles minus the one being read.
 * Replace the body with personalized results once reader preferences exist.
 */
export function useRecommendedArticles(currentArticleId: string | undefined, limit = 4) {
  const { articles, isLoading, isError } = useTrendingArticles(limit + 1)
  const recommended = articles.filter((article) => article.id !== currentArticleId).slice(0, limit)

  return { articles: recommended, isLoading, isError }
}
