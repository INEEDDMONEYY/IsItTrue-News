import type { AuthorArticle } from '../types/authorArticle.types'

export const ARTICLE_CATEGORY_OPTIONS = [
  'Politics',
  'Technology',
  'Health',
  'Business',
  'Local',
  'World',
  'Science',
  'Sports',
]

export const MOCK_AUTHOR_ARTICLES: AuthorArticle[] = [
  {
    id: 'a1',
    title: 'City Council Approves New Zoning Rules Downtown',
    slug: 'city-council-approves-new-zoning-rules-downtown',
    excerpt: 'The 5-2 vote clears the way for mixed-use development along Main Street.',
    category: 'Local',
    tags: [],
    status: 'published',
    createdAt: '2026-06-02T14:00:00.000Z',
    views: 4210,
  },
  {
    id: 'a2',
    title: 'What the New Tariffs Mean for Small Businesses',
    slug: 'what-the-new-tariffs-mean-for-small-businesses',
    excerpt: 'A breakdown of the proposed changes and who they affect most.',
    category: 'Business',
    tags: [],
    status: 'published',
    createdAt: '2026-06-18T09:30:00.000Z',
    views: 8760,
  },
  {
    id: 'a3',
    title: 'Inside the State\u2019s Push for Renewable Energy Credits',
    slug: 'inside-the-states-push-for-renewable-energy-credits',
    excerpt: 'A draft still awaiting a second source before publication.',
    category: 'Politics',
    tags: [],
    status: 'pending_review',
    createdAt: '2026-07-10T11:15:00.000Z',
    views: 0,
  },
  {
    id: 'a4',
    title: 'Untitled draft \u2014 hospital funding follow-up',
    slug: 'untitled-draft-hospital-funding-follow-up',
    excerpt: '',
    category: 'Health',
    tags: [],
    status: 'draft',
    createdAt: '2026-07-20T16:45:00.000Z',
    views: 0,
  },
]
