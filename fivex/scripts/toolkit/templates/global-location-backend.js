/**
 * Backend files for the Global Location module (backend/modules/locations).
 *
 * Every file is a String.raw template. The generated TypeScript avoids template
 * literals so it can be embedded here without escaping. The rules in constants.ts
 * mirror scripts/toolkit/lib/global-location.js, and that drift is covered by the
 * contract test.
 */

const CONSTANTS = String.raw`export const LOCATION_LEVELS = ['global', 'continent', 'subregion', 'country', 'admin_division', 'city', 'district', 'place'] as const
export type LocationLevel = (typeof LOCATION_LEVELS)[number]

export const PRECISION_LEVELS = ['hidden', 'region', 'country', 'subdivision', 'city'] as const
export type PublicPrecision = (typeof PRECISION_LEVELS)[number]

export const RELATIONSHIP_TYPES = ['primary', 'event', 'coverage', 'region', 'country', 'dateline', 'subject'] as const
export type RelationshipType = (typeof RELATIONSHIP_TYPES)[number]

export const SELECTION_METHODS = ['manual', 'device', 'approximate', 'global'] as const
export type SelectionMethod = (typeof SELECTION_METHODS)[number]

export const ASSOCIATION_STATUSES = ['proposed', 'approved', 'rejected'] as const
export type AssociationStatus = (typeof ASSOCIATION_STATUSES)[number]

export const ASSOCIATION_SOURCES = ['author', 'editor', 'backfill'] as const
export type AssociationSource = (typeof ASSOCIATION_SOURCES)[number]

export const CONFIDENCE_LEVELS = ['confirmed', 'uncertain'] as const
export type ConfidenceLevel = (typeof CONFIDENCE_LEVELS)[number]

export const GLOBAL_LOCATION_ID = 'global:world'

const LEVEL_PREFIX: Record<LocationLevel, string> = {
  global: 'global',
  continent: 'continent',
  subregion: 'subregion',
  country: 'country',
  admin_division: 'admin_division',
  city: 'city',
  district: 'district',
  place: 'place',
}

const LEVEL_PRECISION_CAP: Record<LocationLevel, PublicPrecision> = {
  global: 'region',
  continent: 'region',
  subregion: 'region',
  country: 'country',
  admin_division: 'subdivision',
  city: 'city',
  district: 'city',
  place: 'hidden',
}

export interface RelationshipRule {
  singular: boolean
  maxPrecision: PublicPrecision
  allowedLevels: readonly LocationLevel[] | null
}

export const RELATIONSHIP_RULES: Record<RelationshipType, RelationshipRule> = {
  primary: { singular: true, maxPrecision: 'city', allowedLevels: null },
  event: { singular: false, maxPrecision: 'city', allowedLevels: null },
  coverage: { singular: false, maxPrecision: 'city', allowedLevels: null },
  region: { singular: false, maxPrecision: 'region', allowedLevels: ['global', 'continent', 'subregion'] },
  country: { singular: false, maxPrecision: 'country', allowedLevels: ['country'] },
  dateline: { singular: true, maxPrecision: 'city', allowedLevels: null },
  subject: { singular: false, maxPrecision: 'subdivision', allowedLevels: null },
}

export function precisionRank(precision: PublicPrecision): number {
  return PRECISION_LEVELS.indexOf(precision)
}

export function minPrecision(a: PublicPrecision, b: PublicPrecision): PublicPrecision {
  return PRECISION_LEVELS[Math.min(precisionRank(a), precisionRank(b))]
}

export function levelPrecisionCap(level: LocationLevel): PublicPrecision {
  return LEVEL_PRECISION_CAP[level]
}

/** The finest precision that may be published for a location used in a relationship. */
export function maxPublicPrecisionFor(level: LocationLevel, relationship: RelationshipType): PublicPrecision {
  return minPrecision(LEVEL_PRECISION_CAP[level], RELATIONSHIP_RULES[relationship].maxPrecision)
}

export function buildLocationId(level: LocationLevel, code: string): string {
  return LEVEL_PREFIX[level] + ':' + code
}
`

const GEO_LOCATION_MODEL = String.raw`import { Schema, model, type HydratedDocument } from 'mongoose'
import { LOCATION_LEVELS, type LocationLevel } from '../constants.js'

export interface IGeoLocation {
  locationId: string
  level: LocationLevel
  code: string
  name: string
  aliases: string[]
  parentId: string | null
  countryCode: string | null
  timezone: string | null
  latitude: number | null
  longitude: number | null
  source: string
}

const geoLocationSchema = new Schema<IGeoLocation>(
  {
    locationId: { type: String, required: true, unique: true, trim: true },
    level: { type: String, enum: [...LOCATION_LEVELS], required: true },
    code: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    aliases: { type: [String], default: [] },
    parentId: { type: String, default: null },
    countryCode: { type: String, default: null },
    timezone: { type: String, default: null },
    latitude: { type: Number, default: null, min: -90, max: 90 },
    longitude: { type: Number, default: null, min: -180, max: 180 },
    source: { type: String, default: 'seed' },
  },
  { timestamps: true },
)

geoLocationSchema.index({ parentId: 1, name: 1 })
geoLocationSchema.index({ name: 1 })
geoLocationSchema.index({ level: 1, latitude: 1 })

export type GeoLocationDocument = HydratedDocument<IGeoLocation>
export const GeoLocation = model<IGeoLocation>('GeoLocation', geoLocationSchema)
`

const PREFERENCE_MODEL = String.raw`import { Schema, model, Types } from 'mongoose'
import { SELECTION_METHODS, type SelectionMethod } from '../constants.js'

/** Authenticated readers only. Anonymous preferences live in localStorage on the client. */
export interface IReaderLocationPreference {
  userId: Types.ObjectId
  method: SelectionMethod
  locationId: string
}

const readerLocationPreferenceSchema = new Schema<IReaderLocationPreference>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    method: { type: String, enum: [...SELECTION_METHODS], required: true },
    locationId: { type: String, required: true, trim: true },
  },
  { timestamps: true },
)

export const ReaderLocationPreference = model<IReaderLocationPreference>(
  'ReaderLocationPreference',
  readerLocationPreferenceSchema,
)
`

const ASSOCIATION_MODEL = String.raw`import { Schema, model, Types, type HydratedDocument } from 'mongoose'
import {
  ASSOCIATION_SOURCES,
  ASSOCIATION_STATUSES,
  CONFIDENCE_LEVELS,
  PRECISION_LEVELS,
  RELATIONSHIP_TYPES,
  type AssociationSource,
  type AssociationStatus,
  type ConfidenceLevel,
  type PublicPrecision,
  type RelationshipType,
} from '../constants.js'

export interface IArticleGeoAssociation {
  articleId: Types.ObjectId
  locationId: string
  relationshipType: RelationshipType
  publicPrecision: PublicPrecision
  status: AssociationStatus
  confidence: ConfidenceLevel
  source: AssociationSource
  proposedBy: Types.ObjectId | null
  reviewedBy: Types.ObjectId | null
  reviewedAt: Date | null
}

const articleGeoAssociationSchema = new Schema<IArticleGeoAssociation>(
  {
    articleId: { type: Schema.Types.ObjectId, ref: 'Article', required: true },
    locationId: { type: String, required: true, trim: true },
    relationshipType: { type: String, enum: [...RELATIONSHIP_TYPES], required: true },
    publicPrecision: { type: String, enum: [...PRECISION_LEVELS], required: true, default: 'hidden' },
    status: { type: String, enum: [...ASSOCIATION_STATUSES], required: true, default: 'proposed' },
    confidence: { type: String, enum: [...CONFIDENCE_LEVELS], required: true, default: 'uncertain' },
    source: { type: String, enum: [...ASSOCIATION_SOURCES], required: true, default: 'author' },
    proposedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true },
)

articleGeoAssociationSchema.index({ articleId: 1, locationId: 1, relationshipType: 1 }, { unique: true })
articleGeoAssociationSchema.index(
  { articleId: 1, relationshipType: 1 },
  { unique: true, partialFilterExpression: { relationshipType: { $in: ['primary', 'dateline'] } } },
)
articleGeoAssociationSchema.index({ articleId: 1, status: 1 })

export type ArticleGeoAssociationDocument = HydratedDocument<IArticleGeoAssociation>
export const ArticleGeoAssociation = model<IArticleGeoAssociation>('ArticleGeoAssociation', articleGeoAssociationSchema)
`

const PROVIDER = String.raw`import { createGeonamesProvider } from './geonamesLocationProvider.js'

export interface ProviderPlace {
  code: string
  name: string
  countryCode: string
  adminCode1: string | null
  timezone: string | null
  latitude: number
  longitude: number
}

export interface LocationProvider {
  readonly name: 'local' | 'geonames'
  search(query: string, limit: number): Promise<ProviderPlace[]>
}

const localProvider: LocationProvider = {
  name: 'local',
  async search() {
    return []
  },
}

/** Selected with LOCATION_PROVIDER. The local provider searches the Mongo seed only. */
export function createLocationProvider(): LocationProvider {
  return process.env.LOCATION_PROVIDER === 'geonames' ? createGeonamesProvider() : localProvider
}
`

const GEONAMES_PROVIDER = String.raw`import { AppError } from '../../../shared/errors/AppError.js'
import type { LocationProvider, ProviderPlace } from './locationProvider.js'

/**
 * GeoNames (CC BY 4.0). Attribution must be shown wherever results are displayed.
 * Response field names are based on the public searchJSON documentation and must be
 * verified against a live response before production use.
 */
const SEARCH_URL = 'https://secure.geonames.org/searchJSON'
const CACHE_TTL_MS = 24 * 60 * 60 * 1000
const CACHE_LIMIT = 500

interface GeonamesPlace {
  geonameId?: number
  name?: string
  countryCode?: string
  adminCode1?: string
  lat?: string
  lng?: string
  timezone?: { timeZoneId?: string }
}

interface GeonamesResponse {
  geonames?: GeonamesPlace[]
  status?: { message: string; value: number }
}

const cache = new Map<string, { expiresAt: number; places: ProviderPlace[] }>()

function toPlace(place: GeonamesPlace): ProviderPlace | null {
  const latitude = Number(place.lat)
  const longitude = Number(place.lng)
  if (place.geonameId === undefined || !place.name || !place.countryCode) return null
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null
  return {
    code: String(place.geonameId),
    name: place.name,
    countryCode: place.countryCode,
    adminCode1: place.adminCode1 || null,
    timezone: place.timezone?.timeZoneId ?? null,
    latitude,
    longitude,
  }
}

export function createGeonamesProvider(): LocationProvider {
  return {
    name: 'geonames',
    async search(query: string, limit: number): Promise<ProviderPlace[]> {
      const username = process.env.GEONAMES_USERNAME
      if (!username) throw new AppError('GeoNames provider is not configured', 503)

      const key = query.toLowerCase() + '|' + limit
      const cached = cache.get(key)
      if (cached && cached.expiresAt > Date.now()) return cached.places

      const params = new URLSearchParams({
        q: query,
        maxRows: String(limit),
        featureClass: 'P',
        orderby: 'relevance',
        username,
      })

      let body: GeonamesResponse
      try {
        const response = await fetch(SEARCH_URL + '?' + params.toString(), { signal: AbortSignal.timeout(5000) })
        if (!response.ok) throw new Error('HTTP ' + response.status)
        body = (await response.json()) as GeonamesResponse
      } catch {
        throw new AppError('Location provider is unavailable', 502)
      }
      if (body.status) throw new AppError('Location provider is unavailable', 502)

      const places = (body.geonames ?? []).map(toPlace).filter((place): place is ProviderPlace => place !== null)
      if (cache.size >= CACHE_LIMIT) {
        const oldest = cache.keys().next().value
        if (oldest !== undefined) cache.delete(oldest)
      }
      cache.set(key, { expiresAt: Date.now() + CACHE_TTL_MS, places })
      return places
    },
  }
}
`

const SERVICE = String.raw`import { createHmac } from 'node:crypto'
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
`

const VALIDATION = String.raw`import { z } from 'zod'
import {
  ASSOCIATION_STATUSES,
  CONFIDENCE_LEVELS,
  GLOBAL_LOCATION_ID,
  PRECISION_LEVELS,
  RELATIONSHIP_TYPES,
  SELECTION_METHODS,
} from '../constants.js'

const locationIdSchema = z.string().trim().regex(/^[a-z_]+:[A-Za-z0-9.-]+$/).max(64)
const articleIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid article id')

export const searchQuerySchema = z.object({
  q: z.string().trim().min(2).max(100),
  limit: z.coerce.number().int().min(1).max(20).default(10),
})

export const browseQuerySchema = z.object({
  parent: locationIdSchema.optional(),
})

export const nearestSchema = z
  .object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  })
  .refine((value) => value.latitude !== 0 || value.longitude !== 0, 'Invalid coordinates')

export const preferenceSchema = z
  .object({
    method: z.enum(SELECTION_METHODS),
    locationId: locationIdSchema,
  })
  .refine((value) => value.method !== 'global' || value.locationId === GLOBAL_LOCATION_ID, 'Global preference must use global:world')

export const discoverQuerySchema = z.object({
  locationId: locationIdSchema.refine((value) => value !== GLOBAL_LOCATION_ID, 'Global has no discovery scope'),
  limit: z.coerce.number().int().min(1).max(50).default(20),
})

export const associationItemSchema = z.object({
  locationId: locationIdSchema,
  relationshipType: z.enum(RELATIONSHIP_TYPES),
  publicPrecision: z.enum(PRECISION_LEVELS),
  confidence: z.enum(CONFIDENCE_LEVELS).default('uncertain'),
})

export const associationsSchema = z.object({
  associations: z.array(associationItemSchema).max(50),
})

export const articleParamSchema = articleIdSchema
export const locationParamSchema = locationIdSchema
export const statusSchema = z.enum(ASSOCIATION_STATUSES)

export type AssociationsBody = z.infer<typeof associationsSchema>
`

const CONTROLLER = String.raw`import type { Request, Response } from 'express'
import type { z } from 'zod'
import { AppError } from '../../../shared/errors/AppError.js'
import { asyncHandler } from '../../../utils/asyncHandler.js'
import * as service from '../services/location.service.js'
import {
  articleParamSchema,
  associationsSchema,
  browseQuerySchema,
  discoverQuerySchema,
  locationParamSchema,
  nearestSchema,
  preferenceSchema,
  searchQuerySchema,
  type AssociationsBody,
} from '../validations/location.validation.js'

function requireUser(req: Request): { id: string; role: string } {
  const user = (req as Request & { user?: { id: string; role: string } }).user
  if (!user) throw new AppError('Authentication required', 401)
  return user
}

function parseInput<S extends z.ZodTypeAny>(schema: S, input: unknown): z.output<S> {
  const result = schema.safeParse(input)
  if (!result.success) {
    throw new AppError(result.error.issues.map((issue) => issue.message).join('; '), 400)
  }
  return result.data
}

export const searchLocations = asyncHandler(async (req: Request, res: Response) => {
  const { q, limit } = parseInput(searchQuerySchema, req.query)
  res.json({ data: await service.searchLocations(q, limit) })
})

export const browseLocations = asyncHandler(async (req: Request, res: Response) => {
  const { parent } = parseInput(browseQuerySchema, req.query)
  res.json({ data: await service.browseLocations(parent ?? null) })
})

export const getLocation = asyncHandler(async (req: Request, res: Response) => {
  const locationId = parseInput(locationParamSchema, req.params.locationId)
  res.json({ data: await service.getLocation(locationId) })
})

export const nearestLocation = asyncHandler(async (req: Request, res: Response) => {
  const { latitude, longitude } = parseInput(nearestSchema, req.body)
  res.json({ data: await service.nearestLocation(latitude, longitude) })
})

export const approximateLocation = asyncHandler(async (req: Request, res: Response) => {
  res.json({ data: await service.approximateCountryForIp(req.get('x-vercel-ip-country')) })
})

export const getReaderPreference = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req)
  res.json({ data: await service.getReaderPreference(user.id) })
})

export const saveReaderPreference = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req)
  const input = parseInput(preferenceSchema, req.body)
  res.json({ data: await service.saveReaderPreference(user.id, input) })
})

export const getPublicArticleLocations = asyncHandler(async (req: Request, res: Response) => {
  const articleId = parseInput(articleParamSchema, req.params.articleId)
  res.json({ data: await service.getPublicArticleLocations(articleId) })
})

export const discoverArticles = asyncHandler(async (req: Request, res: Response) => {
  const { locationId, limit } = parseInput(discoverQuerySchema, req.query)
  res.json({ data: await service.discoverArticlesByLocation(locationId, limit) })
})

export const getReviewArticleLocations = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req)
  const articleId = parseInput(articleParamSchema, req.params.articleId)
  res.json({ data: await service.getReviewArticleLocations(articleId, user) })
})

export const saveArticleLocations = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req)
  const articleId = parseInput(articleParamSchema, req.params.articleId)
  const body: AssociationsBody = parseInput(associationsSchema, req.body)
  res.json({ data: await service.saveArticleLocations(articleId, user, body.associations) })
})
`

const ROUTES = String.raw`import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { authenticate } from '../../../middleware/authenticate.js'
import { validate } from '../../../middleware/validate.js'
import * as controller from '../controllers/location.controller.js'
import { hashIpForRateLimit } from '../services/location.service.js'
import { associationsSchema, nearestSchema, preferenceSchema } from '../validations/location.validation.js'

const readLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many location requests' },
})

const approximateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: (req) => hashIpForRateLimit(req.ip ?? ''),
  message: { message: 'Too many location requests' },
})

export const locationsRoutes = Router()

locationsRoutes.get('/search', readLimiter, controller.searchLocations)
locationsRoutes.get('/browse', readLimiter, controller.browseLocations)
locationsRoutes.post('/nearest', readLimiter, validate(nearestSchema), controller.nearestLocation)
locationsRoutes.get('/approximate', approximateLimiter, controller.approximateLocation)
locationsRoutes.get('/preference', authenticate, controller.getReaderPreference)
locationsRoutes.put('/preference', authenticate, validate(preferenceSchema), controller.saveReaderPreference)
locationsRoutes.get('/articles/:articleId/associations', controller.getPublicArticleLocations)
locationsRoutes.get('/discover', readLimiter, controller.discoverArticles)
locationsRoutes.get('/articles/:articleId/associations/review', authenticate, controller.getReviewArticleLocations)
locationsRoutes.put(
  '/articles/:articleId/associations',
  authenticate,
  validate(associationsSchema),
  controller.saveArticleLocations,
)
locationsRoutes.get('/:locationId', readLimiter, controller.getLocation)
`

/** Relative path (under backend/modules/locations) to file content. */
const COUNTRY_BOUNDARY_SERVICE = String.raw`import { readFileSync } from 'node:fs'

type Position = [number, number]
type Ring = Position[]

interface CountryBoundary {
  iso2: string
  bbox: [number, number, number, number]
  polygons: Ring[][]
}

interface BoundaryFile {
  source: string
  countries: CountryBoundary[]
}

const BOUNDARY_PATH = new URL('../data/countryBoundaries.json', import.meta.url)

let cachedBoundaries: CountryBoundary[] | null = null

function loadBoundaries(): CountryBoundary[] {
  if (!cachedBoundaries) {
    cachedBoundaries = (JSON.parse(readFileSync(BOUNDARY_PATH, 'utf8')) as BoundaryFile).countries
  }
  return cachedBoundaries
}

function crossesRing(longitude: number, latitude: number, ring: Ring): boolean {
  let crossings = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    if ((yi > latitude) !== (yj > latitude) && longitude < ((xj - xi) * (latitude - yi)) / (yj - yi) + xi) {
      crossings = !crossings
    }
  }
  return crossings
}

// Every ring toggles the result, so holes and enclaves inside a country are excluded.
function containsPoint(boundary: CountryBoundary, longitude: number, latitude: number): boolean {
  let inside = false
  for (const polygon of boundary.polygons) {
    for (const ring of polygon) {
      if (crossesRing(longitude, latitude, ring)) inside = !inside
    }
  }
  return inside
}

/** Returns the ISO 3166-1 alpha-2 code of the country containing the point, or null (for example, open ocean). */
export function countryAt(latitude: number, longitude: number): string | null {
  for (const boundary of loadBoundaries()) {
    const [minX, minY, maxX, maxY] = boundary.bbox
    if (longitude < minX || longitude > maxX || latitude < minY || latitude > maxY) continue
    if (containsPoint(boundary, longitude, latitude)) return boundary.iso2
  }
  return null
}
`

export function locationBackendFiles() {
  return {
    'constants.ts': CONSTANTS,
    'models/geoLocation.model.ts': GEO_LOCATION_MODEL,
    'models/readerLocationPreference.model.ts': PREFERENCE_MODEL,
    'models/articleGeoAssociation.model.ts': ASSOCIATION_MODEL,
    'providers/locationProvider.ts': PROVIDER,
    'providers/geonamesLocationProvider.ts': GEONAMES_PROVIDER,
    'services/countryBoundary.service.ts': COUNTRY_BOUNDARY_SERVICE,
    'services/location.service.ts': SERVICE,
    'validations/location.validation.ts': VALIDATION,
    'controllers/location.controller.ts': CONTROLLER,
    'routes/locations.routes.ts': ROUTES,
  }
}
