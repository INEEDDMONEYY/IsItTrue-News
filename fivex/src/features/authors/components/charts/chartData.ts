import type { AuthorArticle } from '../../types/authorArticle.types'

export function buildViewsTrend(articles: AuthorArticle[]) {
  const sorted = [...articles].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  )
  let cumulative = 0
  return sorted.map((a) => {
    cumulative += a.views
    return { label: new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short' }), value: cumulative }
  })
}

export function buildStatusBreakdown(articles: AuthorArticle[]) {
  const counts: Record<string, number> = {}
  articles.forEach((a) => {
    counts[a.status] = (counts[a.status] ?? 0) + 1
  })
  return Object.entries(counts).map(([status, count]) => ({ status, count }))
}

export function buildCategoryBreakdown(articles: AuthorArticle[]) {
  const counts: Record<string, number> = {}
  articles.forEach((a) => {
    counts[a.category] = (counts[a.category] ?? 0) + 1
  })
  return Object.entries(counts).map(([category, count]) => ({ category, count }))
}