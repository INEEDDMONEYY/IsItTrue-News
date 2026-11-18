import { articleRepository } from '../repositories/article.repository.js'
import type { ArticleDocument } from '../models/Article.js'
import { toPublicTeaser } from './article.service.js'

export interface EngagedArticle {
  id: string
  category: string
  bookmarked: boolean
  liked: boolean
}

const BOOKMARK_WEIGHT = 2
const LIKE_WEIGHT = 1
const TRENDING_REASON = 'Trending right now'

// Categories the reader engages with most. Saves count more than likes.
export function topInterestCategories(engaged: EngagedArticle[], max = 3): string[] {
  const scores = new Map<string, number>()
  for (const item of engaged) {
    const weight = (item.bookmarked ? BOOKMARK_WEIGHT : 0) + (item.liked ? LIKE_WEIGHT : 0)
    if (weight === 0) continue
    scores.set(item.category, (scores.get(item.category) ?? 0) + weight)
  }
  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([category]) => category)
}

async function loadEngagement(userId: string): Promise<EngagedArticle[]> {
  const [bookmarked, liked] = await Promise.all([
    articleRepository.findBookmarkedByUser(userId),
    articleRepository.findLikedByUser(userId),
  ])
  const byId = new Map<string, EngagedArticle>()
  const record = (article: ArticleDocument, kind: 'bookmarked' | 'liked') => {
    const id = article.id as string
    const entry = byId.get(id) ?? { id, category: article.category, bookmarked: false, liked: false }
    byId.set(id, { ...entry, [kind]: true })
  }
  for (const { article } of bookmarked) record(article, 'bookmarked')
  for (const article of liked) record(article, 'liked')
  return [...byId.values()]
}

// The For You feed. Signed-in readers get articles from their top categories, then trending articles to fill up.
// Anonymous readers get trending articles.
export async function buildForYouFeed(userId: string | undefined, limit: number) {
  const engaged = userId ? await loadEngagement(userId) : []
  const categories = topInterestCategories(engaged)
  const seenIds = new Set<string>(engaged.map((item) => item.id))
  const picked: Array<{ article: ArticleDocument; reason: string }> = []

  if (categories.length > 0) {
    const candidates = await articleRepository.findPublishedInCategories(categories, [...seenIds], limit)
    for (const article of candidates) {
      if (picked.length >= limit) break
      picked.push({ article, reason: `Because you save or like ${article.category} stories` })
      seenIds.add(article.id as string)
    }
  }

  if (picked.length < limit) {
    const trending = await articleRepository.findTrendingPublished(limit * 2)
    for (const article of trending) {
      if (picked.length >= limit) break
      if (seenIds.has(article.id as string)) continue
      picked.push({ article, reason: TRENDING_REASON })
      seenIds.add(article.id as string)
    }
  }

  return picked.map(({ article, reason }) => ({ ...toPublicTeaser(article), reason }))
}
