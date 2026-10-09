import { AppError } from '../../../shared/errors/AppError.js'
import { FREE_PLAN_LIMITS } from '../../../shared/constants/plan.js'
import { hasPremiumAccess } from '../../../shared/constants/features.js'
import { userRepository } from '../../users/repositories/user.repository.js'
import { searchRepository, type SearchResultItem } from '../repositories/search.repository.js'

export type SearchType = 'all' | 'articles' | 'videos' | 'authors' | 'topics'
export type SearchAccessLevel = 'anonymous' | 'free' | 'premium'

export interface SearchResults {
  articles: SearchResultItem[]
  videos: SearchResultItem[]
  authors: SearchResultItem[]
  topics: SearchResultItem[]
  accessLevel: SearchAccessLevel
  // Anonymous/premium searches are unlimited (both null); free-plan readers
  // get a monthly cap.
  usage: { limit: number | null; remaining: number | null }
  // Anonymous visitors always get unfiltered "all types" results — filtering
  // by type requires a free or premium account.
  filtersAllowed: boolean
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

async function runSearch(q: string, type: SearchType): Promise<Omit<SearchResults, 'accessLevel' | 'usage' | 'filtersAllowed'>> {
  const regex = new RegExp(escapeRegex(q), 'i')
  const wantsAll = type === 'all'

  const [articles, videos, authors, topics] = await Promise.all([
    wantsAll || type === 'articles' ? searchRepository.searchArticles(regex) : [],
    wantsAll || type === 'videos' ? searchRepository.searchVideos(regex) : [],
    wantsAll || type === 'authors' ? searchRepository.searchAuthors(regex) : [],
    wantsAll || type === 'topics' ? searchRepository.searchTopics(regex) : [],
  ])

  return { articles, videos, authors, topics }
}

export const searchService = {
  // Anonymous visitors can search unlimited times, but only get unfiltered
  // "all types" results (title/summary/author metadata only — no evidence,
  // no investigations). Free-plan readers get FREE_PLAN_LIMITS.searchesPerMonth
  // filtered searches; premium is unlimited with full filters.
  async search(q: string, type: SearchType, userId?: string): Promise<SearchResults> {
    if (!userId) {
      const results = await runSearch(q, 'all')
      return {
        ...results,
        accessLevel: 'anonymous',
        usage: { limit: null, remaining: null },
        filtersAllowed: false,
      }
    }

    const user = await userRepository.findById(userId)
    if (!user) {
      throw new AppError('Account not found.', 404)
    }

    const isPremium = hasPremiumAccess('unlimitedSearch', user.plan)

    if (isPremium) {
      const results = await runSearch(q, type)
      return {
        ...results,
        accessLevel: 'premium',
        usage: { limit: null, remaining: null },
        filtersAllowed: true,
      }
    }

    await userRepository.resetUsageIfNeeded(userId)
    const fresh = await userRepository.findById(userId)
    const used = fresh?.usage?.searchesThisMonth ?? 0

    if (used >= FREE_PLAN_LIMITS.searchesPerMonth) {
      throw new AppError(
        'You have reached your free plan search limit for this month. Upgrade to premium for unlimited searches.',
        429,
      )
    }

    await userRepository.incrementSearches(userId)
    const results = await runSearch(q, type)

    return {
      ...results,
      accessLevel: 'free',
      usage: {
        limit: FREE_PLAN_LIMITS.searchesPerMonth,
        remaining: Math.max(0, FREE_PLAN_LIMITS.searchesPerMonth - (used + 1)),
      },
      filtersAllowed: true,
    }
  },
}

