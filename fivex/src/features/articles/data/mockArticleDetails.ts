import type { Article } from '@/shared/types/article.types'
import type { ArticleComment, ArticleDetail, FactCheckDetails } from '../types/articleDetail.types'
import { FEATURED_ARTICLE, LATEST_POSTS, TRENDING_ARTICLES } from '@/features/home/data/mockHome'
import { RECOMMENDED_ARTICLES } from '@/features/for-you/data/mockForYou'
import { LOCAL_ARTICLES } from '@/features/local/data/mockLocal'

/** Simple deterministic hash so the same slug always generates the same mock content. */
function hashString(value: string) {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

const BODY_PARAGRAPHS = [
  'Officials confirmed the development during a briefing earlier today, describing it as one of the most significant updates on the story so far.',
  'The announcement follows weeks of public pressure from residents, advocacy groups, and lawmakers who have been calling for clearer answers.',
  'Reporters reviewed public records and spoke with multiple people close to the matter to piece together the timeline of events described here.',
  'Reactions have been mixed, with supporters praising the move as overdue and critics arguing it does not go far enough to address the underlying issue.',
  'It remains unclear how quickly these changes will take effect, and officials have not committed to a firm timeline for the next steps.',
  'IsItTrue News will continue to follow this story and update this article as more verified information becomes available.',
]

const COMMENT_AUTHORS = [
  'Alex Rivera',
  'Priya Natarajan',
  'Sam O\u2019Connor',
  'Jordan Blake',
  'Taylor Kim',
  'Morgan Lee',
]

const COMMENT_TEMPLATES = [
  'This is exactly why we need more transparency on this issue.',
  'Appreciate the sourcing here \u2014 makes it easier to trust the reporting.',
  'Has anyone verified this independently? Would like to see more context.',
  'Great breakdown, though I think the headline oversells it a bit.',
  'Thanks for flagging what\u2019s confirmed versus what\u2019s still developing.',
  'Following this closely, hope there\u2019s a follow-up once more details come out.',
]

const FACT_CHECK_COPY: Record<
  NonNullable<Article['verificationStatus']>,
  { summary: string; source: string }
> = {
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

function buildFactCheck(article: Article, seed: number): FactCheckDetails {
  const status = article.verificationStatus ?? 'unverified'
  const { summary, source } = FACT_CHECK_COPY[status]

  return {
    status,
    summary,
    source,
    checkedBy: seed % 2 === 0 ? 'IsItTrue Fact-Check Team' : 'IsItTrue Research Desk',
    checkedAt: article.publishedAt,
  }
}

function buildContent(article: Article, seed: number): string[] {
  const paragraphs = [article.excerpt ?? BODY_PARAGRAPHS[seed % BODY_PARAGRAPHS.length]]
  for (let i = 0; i < 3; i++) {
    paragraphs.push(BODY_PARAGRAPHS[(seed + i + 1) % BODY_PARAGRAPHS.length])
  }
  return paragraphs
}

function buildComments(article: Article, seed: number): ArticleComment[] {
  return Array.from({ length: 4 }).map((_, i) => {
    const offset = (seed + i * 7) % COMMENT_AUTHORS.length
    return {
      id: `${article.id}-comment-${i}`,
      authorName: COMMENT_AUTHORS[offset],
      content: COMMENT_TEMPLATES[(seed + i * 3) % COMMENT_TEMPLATES.length],
      createdAt: new Date(Date.now() - (i + 1) * 45 * 60 * 1000).toISOString(),
      likes: ((seed + i * 13) % 40) + 1,
    }
  })
}

function toArticleDetail(article: Article): ArticleDetail {
  const seed = hashString(article.slug)

  return {
    ...article,
    content: buildContent(article, seed),
    likes: Math.max(12, Math.round(article.stats.views * 0.018)),
    dislikes: Math.max(1, Math.round(article.stats.views * 0.004)),
    reposts: article.stats.shares,
    factCheck: buildFactCheck(article, seed),
    comments: buildComments(article, seed),
  }
}

const ALL_ARTICLES: Article[] = [
  FEATURED_ARTICLE,
  ...LATEST_POSTS,
  ...TRENDING_ARTICLES,
  ...RECOMMENDED_ARTICLES.map((recommended) => recommended.article),
  ...LOCAL_ARTICLES,
]

export function getArticleDetailBySlug(slug: string): ArticleDetail | undefined {
  const article = ALL_ARTICLES.find((candidate) => candidate.slug === slug)
  return article ? toArticleDetail(article) : undefined
}
