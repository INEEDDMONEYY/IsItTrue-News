import type { Article } from '@/shared/types/article.types'
import type { PublicArticle } from '../types/publicArticle.types'
import type { ArticleDetail } from '../types/articleDetail.types'
import fallbackImage from '@/assets/images/speak-up.jpg'

const VERIFICATION_STATUS_MAP: Record<string, Article['verificationStatus']> = {
  approved: 'verified',
  rejected: 'disputed',
  pending: 'pending',
  none: 'unverified',
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function estimateReadTimeMinutes(body: string): number {
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
    readTimeMinutes: estimateReadTimeMinutes(article.body),
    stats: { views: article.views, comments: 0, shares: 0 },
    verificationStatus: VERIFICATION_STATUS_MAP[article.factCheckStatus ?? 'none'],
  }
}

const FACT_CHECK_COPY: Record<NonNullable<Article['verificationStatus']>, { summary: string; source: string }> = {
  verified: {
    summary:
      'Our team cross-referenced the core claims in this story against public records and at least two independent sources. The claims check out.',
    source: 'Public records, primary source interviews',
  },
  disputed: {
    summary:
      'Some claims in this story conflict with publicly available data. We are seeking clarification from the original source before updating the verdict.',
    source: 'Conflicting public statements',
  },
  pending: {
    summary:
      'This story is currently under review by our fact-checking team. The verdict will be updated once the review is complete.',
    source: 'Awaiting confirmation',
  },
  unverified: {
    summary: 'This story has not yet been submitted for fact-checking.',
    source: 'Not yet reviewed',
  },
}

/**
 * Adapts a real backend article (looked up by slug) into the full
 * `ArticleDetail` shape the article detail page renders — used as a
 * fallback when the requested slug isn't one of the mock stories, so
 * newly-published real articles are viewable instead of hitting a
 * false "Article not found".
 */
export function adaptPublicArticleDetail(article: PublicArticle): ArticleDetail {
  const base = adaptPublicArticle(article)
  const status = base.verificationStatus ?? 'unverified'
  const { summary, source } = FACT_CHECK_COPY[status]

  const content = article.body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)

  return {
    ...base,
    content: content.length ? content : [article.excerpt || article.title],
    bodyHtml: article.body,
    sourceLinks: article.sourceLinks ?? [],
    likes: article.likes,
    dislikes: 0,
    reposts: 0,
    factCheck: {
      status,
      summary,
      source,
      checkedBy: 'IsItTrue Fact-Check Team',
      checkedAt: base.publishedAt,
    },
    comments: [],
  }
}
