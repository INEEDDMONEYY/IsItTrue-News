import type { Article } from '@/shared/types/article.types'
import { CATEGORIES } from '@/features/home/data/mockHome'
import power from '@/assets/images/power.png'
import sameBlood from '@/assets/images/same-blood.png'
import speakUp from '@/assets/images/speak-up.jpg'
import timeToMove from '@/assets/images/time-to-move.jpg'

const STOCK_IMAGES = [power, sameBlood, speakUp, timeToMove]
const author = { id: 'a1', name: 'Nina Cole', role: 'Staff Writer' }

export interface RecommendedArticle {
  article: Article
  reason: string
}

const TITLES = [
  'What the Latest Jobs Report Really Means for Your Paycheck',
  'Inside the Tech Layoffs Reshaping Silicon Valley',
  'Why This Election Cycle Looks Different From the Last',
  'The Climate Policy Debate Heating Up in Congress',
  'How Local Hospitals Are Adapting to Staff Shortages',
  'Breaking Down the New Trade Agreement, Clause by Clause',
]

const REASONS = [
  'Because you read stories about the economy',
  'Trending among readers who follow Technology',
  'Because you follow Politics',
  'Similar to articles you saved',
  'Popular in your area',
  'Because you follow Business',
]

export const RECOMMENDED_ARTICLES: RecommendedArticle[] = TITLES.map((title, i) => ({
  reason: REASONS[i],
  article: {
    id: `foryou-${i}`,
    slug: `for-you-${i}`,
    title,
    excerpt:
      'Curated based on your reading history and topics you follow, refreshed throughout the day.',
    thumbnailUrl: STOCK_IMAGES[i % STOCK_IMAGES.length],
    category: CATEGORIES[i % CATEGORIES.length],
    author,
    publishedAt: new Date(Date.now() - i * 3 * 60 * 60 * 1000).toISOString(),
    readTimeMinutes: 4 + (i % 5),
    stats: { views: 4200 + i * 310, comments: 12 + i * 4, shares: 8 + i * 2 },
  },
}))
