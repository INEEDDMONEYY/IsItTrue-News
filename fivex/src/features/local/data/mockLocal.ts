import type { Article, Category } from '@/shared/types/article.types'
import power from '@/assets/images/power.png'
import sameBlood from '@/assets/images/same-blood.png'
import speakUp from '@/assets/images/speak-up.jpg'
import timeToMove from '@/assets/images/time-to-move.jpg'

const STOCK_IMAGES = [timeToMove, power, speakUp, sameBlood]
const author = { id: 'a2', name: 'Marcus Webb', role: 'Local Reporter' }

export const MOCK_LOCATION = 'New York, NY'

export const LOCAL_CATEGORIES: Category[] = [
  { id: 'l1', name: 'City Hall', slug: 'city-hall', colorToken: 'tag-1' },
  { id: 'l2', name: 'Schools & Education', slug: 'schools', colorToken: 'tag-2' },
  { id: 'l3', name: 'Traffic & Transit', slug: 'traffic', colorToken: 'tag-3' },
  { id: 'l4', name: 'Weather', slug: 'weather', colorToken: 'tag-4' },
  { id: 'l5', name: 'Community Events', slug: 'community', colorToken: 'tag-1' },
]

const TITLES = [
  'City Council Approves Funding for Downtown Transit Hub',
  'Local School District Announces New After-School Programs',
  'Weekend Road Closures Planned for Main Street Repaving',
  'Neighborhood Farmers Market Returns for Summer Season',
  'City Weighs New Zoning Rules for Riverfront Development',
  'Flood Watch Issued Ahead of Weekend Storms',
]

export const LOCAL_ARTICLES: Article[] = TITLES.map((title, i) => ({
  id: `local-${i}`,
  slug: `local-${i}`,
  title,
  excerpt: 'Reporting from your neighborhood, verified with local officials and residents.',
  thumbnailUrl: STOCK_IMAGES[i % STOCK_IMAGES.length],
  category: LOCAL_CATEGORIES[i % LOCAL_CATEGORIES.length],
  author,
  publishedAt: new Date(Date.now() - i * 5 * 60 * 60 * 1000).toISOString(),
  readTimeMinutes: 3 + (i % 4),
  stats: { views: 900 + i * 120, comments: 4 + i, shares: 2 + i },
}))
