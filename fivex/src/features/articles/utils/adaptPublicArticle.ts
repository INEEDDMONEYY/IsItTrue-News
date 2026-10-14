import type { Article } from '@/shared/types/article.types'
import { slugify } from '@/lib/slugify'
import type { PublicArticle } from '../types/publicArticle.types'
import type { ArticleDetail, ArticleTag } from '../types/articleDetail.types'
import fallbackImage from '@/assets/images/speak-up.jpg'

const VERIFICATION_STATUS_MAP: Record<string, Article['verificationStatus']> = {
  approved: 'verified',
  rejected: 'disputed',
  pending: 'pending',
  none: 'unverified',
}

// The author's tag names, each with the address of its tag page. A name that has no usable slug (only symbols)
// can't be linked to, so it is left out, and a tag typed twice with different casing shows once.
export function toArticleTags(names: readonly string[] | undefined): ArticleTag[] {
  const seen = new Set<string>()
  const tags: ArticleTag[] = []
  for (const name of names ?? []) {
    const slug = slugify(name)
    if (!slug || seen.has(slug)) continue
    seen.add(slug)
    tags.push({ name: name.trim(), slug })
  }
  return tags
}

export function estimateReadTimeMinutes(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

/**
 * Adapts a real backend article (from the public category/tag listing
 * endpoints) into the shared mock `Article` shape so it can be rendered by
 * the same `ArticleCard` component used throughout the rest of the app.
 */
export function adaptPublicArticle(article: PublicArticle): Article {
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    thumbnailUrl: article.articleImageUrl || fallbackImage,
    category: {
      id: article.category,
      name: article.category,
      slug: slugify(article.category),
    },
    author: { id: article.author?.id ?? 'unknown', name: article.author?.name ?? 'Staff Writer' },
    publishedAt: article.publishedAt ?? article.createdAt,
    readTimeMinutes: article.readTimeMinutes ?? estimateReadTimeMinutes(article.body ?? article.excerpt),
    stats: { views: article.views, comments: 0, shares: 0 },
    verificationStatus: VERIFICATION_STATUS_MAP[article.factCheckStatus ?? 'none'],
  }
}

/**
 * Adapts a real backend article (looked up by slug) into the full
 * `ArticleDetail` shape the article detail page renders — used as a
 * fallback when the requested slug isn't one of the mock stories, so
 * newly-published real articles are viewable instead of hitting a
 * false "Article not found". Fact-check data is not part of this: the page
 * loads it separately from the real fact-check records.
 */
export function adaptPublicArticleDetail(article: PublicArticle): ArticleDetail {
  const base = adaptPublicArticle(article)

  const content = (article.body ?? '')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)

  return {
    ...base,
    content: content.length ? content : [article.excerpt || article.title],
    bodyHtml: article.body,
    locked: article.locked,
    lockedPreview: article.lockedPreview,
    sourceLinks: article.sourceLinks ?? [],
    tags: toArticleTags(article.tags),
    corrections: article.corrections ?? [],
    likes: article.likes,
    dislikes: article.dislikes,
    reposts: article.shares,
    bookmarks: article.bookmarks,
    comments: [],
  }
}
