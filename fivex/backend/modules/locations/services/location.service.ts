import { createHmac } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { Types } from 'mongoose'
import { AppError } from '../../../shared/errors/AppError.js'
import { ROLES } from '../../../shared/constants/roles.js'
import { Article } from '../../articles/models/Article.js'
import { ARTICLE_STATUSES } from '../../articles/constants/articleStatus.js'
import {
  GLOBAL_LOCATION_ID,
  RELATIONSHIP_RULES,
  buildLocationId,
  levelPrecisionCap,
  maxPublicPrecisionFor,
  minPrecision,
  precisionRank,
  type LocationLevel,
  type PublicPrecision,
  type RelationshipType,
  type ConfidenceLevel,
  type SelectionMethod,
  type AssociationStatus,
  type AssociationSource,
} from '../constants.js'
import { GeoLocation, type GeoLocationDocument } from '../models/geoLocation.model.js'
import { ReaderLocationPreference } from '../models/readerLocationPreference.model.js'
import { ArticleGeoAssociation, type ArticleGeoAssociationDocument } from '../models/articleGeoAssociation.model.js'
import { createLocationProvider } from '../providers/locationProvider.js'
import { countryAt } from './countryBoundary.service.js'

export interface LocationView {
  locationId: string
  level: LocationLevel
  name: string
  countryCode: string | null
  parentId: string | null
  timezone: string | null
}

export interface PreferenceView {
  method: SelectionMethod
  locationId: string
}

export interface AssociationInput {
  locationId: string
  relationshipType: RelationshipType
  publicPrecision: PublicPrecision
  confidence: ConfidenceLevel
}

export interface PublicAssociation {
  relationshipType: RelationshipType
  confidence: ConfidenceLevel
  precision: PublicPrecision
  location: LocationView
}

export interface ReviewAssociation extends AssociationInput {
  status: AssociationStatus
  source: AssociationSource
}

export interface DiscoveryItem {
  articleId: string
  slug: string
  title: string
  excerpt: string
  publishedAt: Date | null
  /** exact: the selected place. nested: inside it. broader: a parent place or region containing it. */
  matchLevel: 'exact' | 'nested' | 'broader'
  matchedLocation: LocationView
  relationshipType: RelationshipType
}

export interface SeedRecord {
  level: LocationLevel
  code: string
  name: string
  aliases: string[]
  parent: string | null
  countryCode: string | null
  timezone: string | null
  latitude: number | null
  longitude: number | null
}

export interface SeedFile {
  locations: SeedRecord[]
}

const SEED_PATH = new URL('../data/locations.seed.json', import.meta.url)

function toView(doc: GeoLocationDocument): LocationView {
  return {
    locationId: doc.locationId,
    level: doc.level,
    name: doc.name,
    countryCode: doc.countryCode,
    parentId: doc.parentId,
    timezone: doc.timezone,
  }
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^$()|[\]{}\\]/g, '\\$&')
}

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (degrees: number) => (degrees * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * 6371 * Math.asin(Math.sqrt(a))
}

/** Splits "Austin, Texas" into the place name and the region terms used to rank it. */
export function splitLocationQuery(query: string): { city: string; regions: string[] } {
  const [city = '', ...regions] = query.split(',')
  return { city: city.trim(), regions: regions.map((part) => part.trim()).filter(Boolean) }
}

type RegionContainer = { name: string; aliases: string[]; code: string }

function matchesRegion(container: RegionContainer | undefined, regions: string[]): boolean {
  if (!container) return false
  const names = [container.name, container.code, container.code.split('-').pop() ?? '', ...container.aliases].map((value) => value.toLowerCase())
  return regions.some((region) => names.includes(region.toLowerCase()))
}

/** Matching is ranking, not exclusion: a region that matches nothing still leaves the place in the results. */
export async function searchLocations(query: string, limit: number): Promise<LocationView[]> {
  const { city, regions } = splitLocationQuery(query)
  if (city.length < 2) return []

  const provider = createLocationProvider()
  if (provider.name === 'geonames') {
    await importProviderPlaces(await provider.search(city, regions.length > 0 ? Math.max(limit, 20) : limit))
  }

  const pattern = new RegExp(escapeRegex(city), 'i')
  const docs = await GeoLocation.find({ $or: [{ name: pattern }, { aliases: pattern }] })
    .sort({ name: 1 })
    .limit(regions.length > 0 ? 200 : limit)

  const containers = new Map<string, RegionContainer>()
  if (regions.length > 0) {
    const parentIds = [...new Set(docs.map((doc) => doc.parentId).filter((id): id is string => Boolean(id)))]
    const parents = await GeoLocation.find({ locationId: { $in: parentIds } })
    for (const parent of parents) containers.set(parent.locationId, parent)
  }

  const exact = city.toLowerCase()
  const ranked = docs
    .map((doc) => {
      const containerMatch = regions.length > 0 && matchesRegion(containers.get(doc.parentId ?? ''), regions)
      const score = (doc.name.toLowerCase() === exact ? 4 : 0) + (containerMatch ? 2 : 0)
      return { doc, score }
    })
    .sort((a, b) => b.score - a.score)
  return ranked.slice(0, limit).map((item) => toView(item.doc))
}

/** Stores GeoNames results only when their country exists locally, so every parent reference resolves. */
async function importProviderPlaces(places: Awaited<ReturnType<ReturnType<typeof createLocationProvider>['search']>>): Promise<void> {
  for (const place of places) {
    const countryId = buildLocationId('country', place.countryCode)
    if (!(await GeoLocation.exists({ locationId: countryId }))) continue
    const stateId = place.adminCode1 ? buildLocationId('admin_division', place.countryCode + '-' + place.adminCode1) : null
    const parentId = stateId && (await GeoLocation.exists({ locationId: stateId })) ? stateId : countryId
    const locationId = buildLocationId('city', place.code)
    await GeoLocation.updateOne(
      { locationId },
      {
        $set: {
          level: 'city',
          code: place.code,
          name: place.name,
          parentId,
          countryCode: place.countryCode,
          timezone: place.timezone,
          latitude: place.latitude,
          longitude: place.longitude,
          source: 'geonames',
        },
        $setOnInsert: { locationId, aliases: [] },
      },
      { upsert: true },
    )
  }
}

export async function browseLocations(parentId: string | null): Promise<LocationView[]> {
  const docs = await GeoLocation.find({ parentId: parentId ?? GLOBAL_LOCATION_ID }).sort({ name: 1 }).limit(200)
  return docs.map(toView)
}

export async function getLocation(locationId: string): Promise<LocationView> {
  const doc = await GeoLocation.findOne({ locationId })
  if (!doc) throw new AppError('Location not found', 404)
  return toView(doc)
}

/**
 * Returns the nearest seeded city within 300 km, otherwise the country that contains the point.
 * Coordinates are used for this request only and are never stored.
 */
export async function nearestLocation(latitude: number, longitude: number): Promise<LocationView | null> {
  const cities = await GeoLocation.find({ level: 'city', latitude: { $ne: null }, longitude: { $ne: null } })
  let best: { doc: GeoLocationDocument; km: number } | null = null
  for (const doc of cities) {
    const km = distanceKm(latitude, longitude, doc.latitude ?? 0, doc.longitude ?? 0)
    if (!best || km < best.km) best = { doc, km }
  }
  if (best && best.km <= 300) return toView(best.doc)

  const iso2 = countryAt(latitude, longitude)
  if (!iso2) return null
  const country = await GeoLocation.findOne({ locationId: buildLocationId('country', iso2) })
  return country ? toView(country) : null
}

export async function getReaderPreference(userId: string): Promise<PreferenceView> {
  const saved = await ReaderLocationPreference.findOne({ userId: new Types.ObjectId(userId) })
  if (saved && (await GeoLocation.exists({ locationId: saved.locationId }))) {
    return { method: saved.method, locationId: saved.locationId }
  }
  // A saved location that no longer exists falls back to Global.
  return { method: 'global', locationId: GLOBAL_LOCATION_ID }
}

export async function saveReaderPreference(userId: string, input: PreferenceView): Promise<PreferenceView> {
  if (input.method === 'global' && input.locationId !== GLOBAL_LOCATION_ID) {
    throw new AppError('Global preference must use the global location', 400)
  }
  if (!(await GeoLocation.exists({ locationId: input.locationId }))) {
    throw new AppError('Unknown location', 400)
  }
  const saved = await ReaderLocationPreference.findOneAndUpdate(
    { userId: new Types.ObjectId(userId) },
    { $set: { method: input.method, locationId: input.locationId } },
    { upsert: true, new: true },
  )
  return { method: saved.method, locationId: saved.locationId }
}

/** Lowers the stored precision to the finest allowed, then walks up to the matching ancestor. */
async function projectAssociation(association: ArticleGeoAssociationDocument): Promise<PublicAssociation | null> {
  const start = await GeoLocation.findOne({ locationId: association.locationId })
  if (!start) return null
  const precision = minPrecision(association.publicPrecision, maxPublicPrecisionFor(start.level, association.relationshipType))
  if (precision === 'hidden') return null

  let current: GeoLocationDocument | null = start
  for (let depth = 0; current && depth < 10; depth += 1) {
    if (precisionRank(levelPrecisionCap(current.level)) <= precisionRank(precision)) break
    current = current.parentId ? await GeoLocation.findOne({ locationId: current.parentId }) : null
  }
  if (!current) return null
  return {
    relationshipType: association.relationshipType,
    confidence: association.confidence,
    precision,
    location: toView(current),
  }
}

export async function getPublicArticleLocations(articleId: string): Promise<PublicAssociation[]> {
  const article = await Article.findById(articleId)
  if (!article || article.status !== ARTICLE_STATUSES.PUBLISHED) throw new AppError('Article not found', 404)
  const approved = await ArticleGeoAssociation.find({ articleId, status: 'approved' })
  const projected = await Promise.all(approved.map(projectAssociation))
  return projected.filter((item): item is PublicAssociation => item !== null)
}

const MATCH_RANK = { exact: 3, nested: 2, broader: 1 } as const

/**
 * Published articles whose approved, publicly projected locations relate to a selected place.
 * Ranking is by relevance, not a hard filter: exact matches first, then places inside the
 * selection, then parent places and regions that contain it. Matches use the projected
 * location, so a coarsened or hidden association can never match a finer selection.
 */
export async function discoverArticlesByLocation(locationId: string, limit: number): Promise<DiscoveryItem[]> {
  if (locationId === GLOBAL_LOCATION_ID) throw new AppError('Global does not filter by location', 400)
  const all = await GeoLocation.find()
  const target = all.find((doc) => doc.locationId === locationId)
  if (!target) throw new AppError('Location not found', 404)

  const children = new Map<string, string[]>()
  for (const doc of all) {
    if (doc.parentId) children.set(doc.parentId, [...(children.get(doc.parentId) ?? []), doc.locationId])
  }
  const descendants = new Set<string>()
  const stack = [...(children.get(locationId) ?? [])]
  while (stack.length > 0) {
    const id = stack.pop() as string
    if (descendants.has(id)) continue
    descendants.add(id)
    stack.push(...(children.get(id) ?? []))
  }
  const byId = new Map(all.map((doc) => [doc.locationId, doc]))
  const ancestors = new Set<string>()
  for (let parent = target.parentId, depth = 0; parent && depth < 10; depth += 1) {
    ancestors.add(parent)
    parent = byId.get(parent)?.parentId ?? null
  }

  const approved = await ArticleGeoAssociation.find({ status: 'approved' })
  const best = new Map<string, { matchLevel: DiscoveryItem['matchLevel']; relationshipType: RelationshipType; location: LocationView }>()
  for (const association of approved) {
    const projected = await projectAssociation(association)
    if (!projected) continue
    const id = projected.location.locationId
    const matchLevel: DiscoveryItem['matchLevel'] | null =
      id === locationId ? 'exact' : descendants.has(id) ? 'nested' : ancestors.has(id) ? 'broader' : null
    if (!matchLevel) continue
    const articleKey = String(association.articleId)
    const previous = best.get(articleKey)
    if (!previous || MATCH_RANK[matchLevel] > MATCH_RANK[previous.matchLevel]) {
      best.set(articleKey, { matchLevel, relationshipType: association.relationshipType, location: projected.location })
    }
  }

  const articles = await Article.find({ _id: { $in: [...best.keys()] }, status: ARTICLE_STATUSES.PUBLISHED })
    .select('title slug excerpt publishedAt')
    .lean()
  const items: DiscoveryItem[] = []
  for (const article of articles) {
    const match = best.get(String(article._id))
    if (!match) continue
    items.push({
      articleId: String(article._id),
      slug: article.slug,
      title: article.title,
      excerpt: article.excerpt,
      publishedAt: article.publishedAt ?? null,
      matchLevel: match.matchLevel,
      matchedLocation: match.location,
      relationshipType: match.relationshipType,
    })
  }
  items.sort((a, b) => {
    const byRank = MATCH_RANK[b.matchLevel] - MATCH_RANK[a.matchLevel]
    if (byRank !== 0) return byRank
    return (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0)
  })
  return items.slice(0, limit)
}

export async function getReviewArticleLocations(
  articleId: string,
  user: { id: string; role: string },
): Promise<ReviewAssociation[]> {
  const article = await Article.findById(articleId)
  if (!article) throw new AppError('Article not found', 404)
  const isEditor = user.role === ROLES.EDITOR || user.role === ROLES.ADMIN
  if (!isEditor && String(article.author) !== user.id) {
    throw new AppError('You cannot view this article\'s locations', 403)
  }
  const docs = await ArticleGeoAssociation.find({ articleId }).sort({ relationshipType: 1, locationId: 1 })
  return docs.map((doc) => ({
    locationId: doc.locationId,
    relationshipType: doc.relationshipType,
    publicPrecision: doc.publicPrecision,
    confidence: doc.confidence,
    status: doc.status,
    source: doc.source,
  }))
}

function assertAssociationsValid(items: AssociationInput[], locations: Map<string, GeoLocationDocument>): void {
  const errors: string[] = []
  const seen = new Set<string>()
  const singular = new Map<string, number>()

  items.forEach((item, index) => {
    const label = 'association ' + index
    const rule = RELATIONSHIP_RULES[item.relationshipType]
    const location = locations.get(item.locationId)
    if (!location) {
      errors.push(label + ': unknown location ' + item.locationId)
      return
    }
    const key = item.locationId + '|' + item.relationshipType
    if (seen.has(key)) errors.push(label + ': duplicate ' + item.relationshipType + ' association')
    seen.add(key)

    if (rule.allowedLevels && !rule.allowedLevels.includes(location.level)) {
      errors.push(label + ': ' + item.relationshipType + ' cannot use a ' + location.level + ' location')
    }
    if (precisionRank(item.publicPrecision) > precisionRank(maxPublicPrecisionFor(location.level, item.relationshipType))) {
      errors.push(label + ': precision ' + item.publicPrecision + ' is finer than allowed for a ' + location.level + ' location')
    }
    if (rule.singular) singular.set(item.relationshipType, (singular.get(item.relationshipType) ?? 0) + 1)
  })

  for (const [type, count] of singular) {
    if (count > 1) errors.push('at most one ' + type + ' location is allowed per article')
  }
  if (errors.length > 0) throw new AppError(errors.join('; '), 400)
}

/**
 * Replaces an article's associations. Editors and admins may save any status they set
 * (approved by default). Authors may only edit their own articles, and their entries
 * are always stored as proposed. Replacing the set resets approvals, so editors should re-approve.
 */
export async function saveArticleLocations(
  articleId: string,
  user: { id: string; role: string },
  items: AssociationInput[],
): Promise<ReviewAssociation[]> {
  const article = await Article.findById(articleId)
  if (!article) throw new AppError('Article not found', 404)

  const isEditor = user.role === ROLES.EDITOR || user.role === ROLES.ADMIN
  const isAuthor = String(article.author) === user.id
  if (!isEditor && !isAuthor) throw new AppError('You cannot edit this article\'s locations', 403)

  const ids = [...new Set(items.map((item) => item.locationId))]
  const docs = await GeoLocation.find({ locationId: { $in: ids } })
  const locations = new Map(docs.map((doc) => [doc.locationId, doc]))
  assertAssociationsValid(items, locations)

  const status: AssociationStatus = isEditor ? 'approved' : 'proposed'
  await ArticleGeoAssociation.deleteMany({ articleId })
  if (items.length > 0) {
    await ArticleGeoAssociation.insertMany(
      items.map((item) => ({
        articleId: new Types.ObjectId(articleId),
        locationId: item.locationId,
        relationshipType: item.relationshipType,
        publicPrecision: item.publicPrecision,
        confidence: item.confidence,
        status,
        source: isEditor ? 'editor' : 'author',
        proposedBy: new Types.ObjectId(user.id),
        reviewedBy: isEditor ? new Types.ObjectId(user.id) : null,
        reviewedAt: isEditor ? new Date() : null,
      })),
    )
  }
  return getReviewArticleLocations(articleId, user)
}

/** Called when an editor approves an article, so its author-proposed locations become public too. */
export async function approveProposedAssociations(articleId: string, reviewerId: string): Promise<void> {
  await ArticleGeoAssociation.updateMany(
    { articleId: new Types.ObjectId(articleId), status: 'proposed' },
    { $set: { status: 'approved', reviewedBy: new Types.ObjectId(reviewerId), reviewedAt: new Date() } },
  )
}

/** Keys the approximate-location rate limiter. The raw IP is never stored or logged. */
export function hashIpForRateLimit(ip: string): string {
  return createHmac('sha256', process.env.LOCATION_IP_HASH_SECRET ?? '').update(ip).digest('hex')
}

/**
 * Country-level estimate from the host's geo header (Vercel sets x-vercel-ip-country).
 * The client IP is never read, stored, or logged, and the result is approximate until the reader confirms it.
 */
export async function approximateCountryForIp(countryHeader: string | undefined): Promise<LocationView> {
  const code = countryHeader?.trim().toUpperCase()
  if (!code || !/^[A-Z]{2}$/.test(code)) throw new AppError('Approximate location is unavailable', 503)
  return getLocation(buildLocationId('country', code))
}

/** Reads the seed copied into data/ by the generator. It is not run at startup. */
export function readSeedFile(): SeedFile {
  return JSON.parse(readFileSync(SEED_PATH, 'utf8')) as SeedFile
}

export async function seedLocations(seed: SeedFile): Promise<number> {
  for (const record of seed.locations) {
    const locationId = buildLocationId(record.level, record.code)
    await GeoLocation.updateOne(
      { locationId },
      {
        $set: {
          level: record.level,
          code: record.code,
          name: record.name,
          aliases: record.aliases,
          parentId: record.parent,
          countryCode: record.countryCode,
          timezone: record.timezone,
          latitude: record.latitude,
          longitude: record.longitude,
          source: 'seed',
        },
      },
      { upsert: true },
    )
  }
  return seed.locations.length
}
