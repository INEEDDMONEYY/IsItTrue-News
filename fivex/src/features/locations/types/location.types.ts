export type LocationLevel =
  | 'global'
  | 'continent'
  | 'subregion'
  | 'country'
  | 'admin_division'
  | 'city'
  | 'district'
  | 'place'

export type SelectionMethod = 'manual' | 'device' | 'approximate' | 'global'

export const GLOBAL_LOCATION_ID = 'global:world'

export interface LocationView {
  locationId: string
  level: LocationLevel
  name: string
  countryCode: string | null
  parentId: string | null
  timezone: string | null
}

/** Reader preference. Kept separate from language, timezone, currency and article metadata. */
export interface ReaderLocationPreference {
  method: SelectionMethod
  locationId: string
}

export const GLOBAL_PREFERENCE: ReaderLocationPreference = {
  method: 'global',
  locationId: GLOBAL_LOCATION_ID,
}

export type RelationshipType = 'primary' | 'event' | 'coverage' | 'region' | 'country' | 'dateline' | 'subject'

export type PublicPrecision = 'hidden' | 'region' | 'country' | 'subdivision' | 'city'

export type ConfidenceLevel = 'confirmed' | 'uncertain'

export type AssociationStatus = 'proposed' | 'approved' | 'rejected'

export type AssociationSource = 'author' | 'editor' | 'backfill'

/** Approved public association, as shown on an article page. */
export interface PublicAssociation {
  relationshipType: RelationshipType
  confidence: ConfidenceLevel
  precision: PublicPrecision
  location: LocationView
}

/** Association including review state, for authors and editors. */
export interface ReviewAssociation {
  locationId: string
  relationshipType: RelationshipType
  publicPrecision: PublicPrecision
  confidence: ConfidenceLevel
  status: AssociationStatus
  source: AssociationSource
}

export interface AssociationInput {
  locationId: string
  relationshipType: RelationshipType
  publicPrecision: PublicPrecision
  confidence: ConfidenceLevel
}

export interface DiscoveryItem {
  articleId: string
  slug: string
  title: string
  excerpt: string
  publishedAt: string | null
  matchLevel: 'exact' | 'nested' | 'broader'
  matchedLocation: LocationView
  relationshipType: RelationshipType
}
