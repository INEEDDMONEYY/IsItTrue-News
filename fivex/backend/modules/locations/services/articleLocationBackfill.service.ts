import { Article } from '../../articles/models/Article.js'
import { buildLocationId, maxPublicPrecisionFor, type LocationLevel } from '../constants.js'
import { ArticleGeoAssociation } from '../models/articleGeoAssociation.model.js'
import { readSeedFile, seedLocations } from './location.service.js'

const MATCHABLE_LEVELS: readonly LocationLevel[] = ['city', 'admin_division', 'country']
const LEVEL_PRIORITY: Record<string, number> = { city: 3, admin_division: 2, country: 1 }
const SHORT_ALIAS_MAX_LENGTH = 3
const SAMPLE_LIMIT = 20

export interface MatchablePlace {
  locationId: string
  level: LocationLevel
  name: string
  aliases: string[]
  countryCode: string | null
}

export interface ArticleText {
  title: string
  excerpt: string
  body: string
}

export interface BackfillSample {
  articleId: string
  title: string
  locationIds: string[]
}

export interface BackfillSummary {
  applied: boolean
  scanned: number
  skippedExisting: number
  matchedArticles: number
  unmatchedArticles: number
  associationsPlanned: number
  associationsCreated: number
  samples: BackfillSample[]
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function htmlToText(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

// Short aliases (UK, USA, NYC, KL) are case-sensitive so ordinary words do not match them.
export function termPattern(term: string): RegExp {
  const flags = term.length <= SHORT_ALIAS_MAX_LENGTH ? 'u' : 'iu'
  return new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegex(term)}(?![\\p{L}\\p{N}])`, flags)
}

// When one term maps to several places (for example "Singapore" as city and country),
// the most specific level wins. Returns locationIds, most specific first.
export function matchLocationIds(text: ArticleText, places: MatchablePlace[]): string[] {
  const haystack = [text.title, text.excerpt, htmlToText(text.body)].join(' \n ')
  const bestByTerm = new Map<string, MatchablePlace>()

  for (const place of places) {
    for (const term of [place.name, ...place.aliases]) {
      if (!termPattern(term).test(haystack)) continue
      const key = term.toLowerCase()
      const current = bestByTerm.get(key)
      if (!current || LEVEL_PRIORITY[place.level] > LEVEL_PRIORITY[current.level]) {
        bestByTerm.set(key, place)
      }
    }
  }

  const unique = new Map<string, MatchablePlace>()
  for (const place of bestByTerm.values()) unique.set(place.locationId, place)
  return [...unique.values()]
    .sort((a, b) => LEVEL_PRIORITY[b.level] - LEVEL_PRIORITY[a.level])
    .map((place) => place.locationId)
}

export function matchablePlacesFromSeed(seed: ReturnType<typeof readSeedFile>): MatchablePlace[] {
  return seed.locations
    .filter((record) => MATCHABLE_LEVELS.includes(record.level as LocationLevel))
    .map((record) => ({
      locationId: buildLocationId(record.level as LocationLevel, record.code),
      level: record.level as LocationLevel,
      name: record.name,
      aliases: record.aliases,
      countryCode: record.countryCode,
    }))
}

// Backfilled rows are `proposed` + `uncertain`, so they stay out of public results until an editor approves them.
export async function backfillArticleLocations({ apply }: { apply: boolean }): Promise<BackfillSummary> {
  const seed = readSeedFile()
  if (apply) await seedLocations(seed)

  const places = matchablePlacesFromSeed(seed)
  const placesById = new Map(places.map((place) => [place.locationId, place]))
  const alreadyLinked = new Set((await ArticleGeoAssociation.distinct('articleId')).map(String))
  const articles = await Article.find({}).select('title excerpt body').lean()

  const summary: BackfillSummary = {
    applied: apply,
    scanned: articles.length,
    skippedExisting: 0,
    matchedArticles: 0,
    unmatchedArticles: 0,
    associationsPlanned: 0,
    associationsCreated: 0,
    samples: [],
  }

  const operations: Parameters<typeof ArticleGeoAssociation.bulkWrite>[0] = []

  for (const article of articles) {
    const articleId = String(article._id)
    if (alreadyLinked.has(articleId)) {
      summary.skippedExisting += 1
      continue
    }

    const locationIds = matchLocationIds(article, places)
    if (locationIds.length === 0) {
      summary.unmatchedArticles += 1
      continue
    }

    summary.matchedArticles += 1
    summary.associationsPlanned += locationIds.length
    if (summary.samples.length < SAMPLE_LIMIT) {
      summary.samples.push({ articleId, title: article.title, locationIds })
    }

    for (const locationId of locationIds) {
      const place = placesById.get(locationId)
      if (!place) continue
      operations.push({
        updateOne: {
          filter: { articleId: article._id, locationId, relationshipType: 'coverage' },
          update: {
            $setOnInsert: {
              articleId: article._id,
              locationId,
              relationshipType: 'coverage',
              publicPrecision: maxPublicPrecisionFor(place.level, 'coverage'),
              status: 'proposed',
              confidence: 'uncertain',
              source: 'backfill',
              proposedBy: null,
              reviewedBy: null,
              reviewedAt: null,
            },
          },
          upsert: true,
        },
      })
    }
  }

  if (apply && operations.length > 0) {
    const result = await ArticleGeoAssociation.bulkWrite(operations, { ordered: false })
    summary.associationsCreated = result.upsertedCount
  }

  return summary
}
