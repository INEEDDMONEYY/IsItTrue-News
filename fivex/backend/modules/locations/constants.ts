export const LOCATION_LEVELS = ['global', 'continent', 'subregion', 'country', 'admin_division', 'city', 'district', 'place'] as const
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
