import type { Article, Category } from '@/shared/types/article.types'
import power from '@/assets/images/power.png'
import sameBlood from '@/assets/images/same-blood.png'
import speakUp from '@/assets/images/speak-up.jpg'
import timeToMove from '@/assets/images/time-to-move.jpg'

const STOCK_IMAGES = [speakUp, timeToMove, sameBlood, power]

export const CATEGORIES: Category[] = [
  { id: '1', name: 'Politics', slug: 'politics', colorToken: 'tag-1' },
  { id: '2', name: 'World', slug: 'world', colorToken: 'tag-2' },
  { id: '3', name: 'Technology', slug: 'technology', colorToken: 'tag-3' },
  { id: '4', name: 'Business', slug: 'business', colorToken: 'tag-4' },
  { id: '5', name: 'Health', slug: 'health', colorToken: 'tag-1' },
  { id: '6', name: 'Sports', slug: 'sports', colorToken: 'tag-2' },
]

const author = { id: 'a1', name: 'Nina Cole', role: 'Staff Writer' }

export const FEATURED_ARTICLE: Article = {
  id: 'f1',
  slug: 'dems-see-one-last-chance',
  title: 'Dems See One Last Chance To Boost Public Support For Impeachment',
  excerpt:
    'Lawmakers are weighing their remaining options as public opinion continues to shift ahead of the vote.',
  thumbnailUrl: speakUp,
  category: CATEGORIES[0],
  author,
  publishedAt: new Date().toISOString(),
  readTimeMinutes: 6,
  stats: { views: 1500000, comments: 35000, shares: 35000 },
  verificationStatus: 'verified',
}

export const LATEST_POSTS: Article[] = Array.from({ length: 4 }).map((_, i) => ({
  id: `latest-${i}`,
  slug: `latest-post-${i}`,
  title: [
    'Creating an Intuitive UI for Modern Newsrooms',
    'Tips for Designing Clear Navigation for Readers',
    'Exploring Visual Hierarchy That Guides Trust',
    'How to Use Color to Influence Reader Perception',
  ][i],
  thumbnailUrl: STOCK_IMAGES[i % STOCK_IMAGES.length],
  category: CATEGORIES[i % CATEGORIES.length],
  author,
  publishedAt: new Date().toISOString(),
  readTimeMinutes: 10,
  stats: { views: 1200, comments: 30, shares: 12 },
}))

export const TRENDING_ARTICLES: Article[] = Array.from({ length: 6 }).map((_, i) => ({
  id: `trend-${i}`,
  slug: `trending-${i}`,
  title: 'Our Sources Make The Difference In Every Story We Publish',
  excerpt:
    'We verify every claim against primary sources before a story goes live, and flag disputed ones clearly.',
  thumbnailUrl: STOCK_IMAGES[(i + 1) % STOCK_IMAGES.length],
  category: CATEGORIES[i % CATEGORIES.length],
  author,
  publishedAt: new Date().toISOString(),
  readTimeMinutes: 10,
  stats: { views: 800, comments: 5, shares: 3 },
}))