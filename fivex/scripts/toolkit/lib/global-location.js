/**
 * Global Location registry and validation rules.
 *
 * This module is the single source of the constants used by the Global Location
 * generator. The contract JSON mirrors them, and a drift test keeps the two
 * aligned. Geographic identifiers are `<prefix>:<code>` (for example
 * `country:GB`), never display names. Only the seed and the generator read it.
 */
import fs from 'node:fs'
import path from 'node:path'
import { PROJECT_ROOT } from '../../utils/file-system.js'

export const CONTRACT_FILE = 'scripts/contracts/global-location.contract.json'
export const SEED_FILE = 'scripts/contracts/global-location.seed.json'
export const BOUNDARY_FILE = 'backend/modules/locations/data/countryBoundaries.json'
export const HEADER_FILE = 'src/components/navigation/Header.tsx'
export const BACKEND_MODULE = 'modules/locations'
export const FRONTEND_FEATURE = 'features/locations'
export const GLOBAL_LOCATION_ID = 'global:world'

/** Ordered from broadest to finest. A parent must have a lower rank than its child. */
export const LEVELS = [
  { id: 'global', prefix: 'global', maxPublicPrecision: 'region' },
  { id: 'continent', prefix: 'continent', maxPublicPrecision: 'region' },
  { id: 'subregion', prefix: 'subregion', maxPublicPrecision: 'region' },
  { id: 'country', prefix: 'country', maxPublicPrecision: 'country' },
  { id: 'admin_division', prefix: 'admin_division', maxPublicPrecision: 'subdivision' },
  { id: 'city', prefix: 'city', maxPublicPrecision: 'city' },
  { id: 'district', prefix: 'district', maxPublicPrecision: 'city' },
  { id: 'place', prefix: 'place', maxPublicPrecision: 'hidden' },
]

/** Coarsest to finest. Public output never shows anything finer than the chosen precision. */
export const PRECISION_LEVELS = ['hidden', 'region', 'country', 'subdivision', 'city']

/**
 * `singular` relationships allow at most one per article. `allowedLevels` restricts
 * which location levels may be attached (null means any level).
 */
export const RELATIONSHIP_TYPES = [
  { id: 'primary', singular: true, maxPrecision: 'city', allowedLevels: null },
  { id: 'event', singular: false, maxPrecision: 'city', allowedLevels: null },
  { id: 'coverage', singular: false, maxPrecision: 'city', allowedLevels: null },
  { id: 'region', singular: false, maxPrecision: 'region', allowedLevels: ['global', 'continent', 'subregion'] },
  { id: 'country', singular: false, maxPrecision: 'country', allowedLevels: ['country'] },
  { id: 'dateline', singular: true, maxPrecision: 'city', allowedLevels: null },
  { id: 'subject', singular: false, maxPrecision: 'subdivision', allowedLevels: null },
]

export const SELECTION_METHODS = ['manual', 'device', 'approximate', 'global']
export const ASSOCIATION_STATUSES = ['proposed', 'approved', 'rejected']
export const CONFIDENCE_LEVELS = ['confirmed', 'uncertain']

/** Proposed endpoints. Generated routes implement these; nothing is registered in the app by default. */
export const OPERATIONS = [
  { name: 'searchLocations', method: 'GET', path: '/api/locations/search' },
  { name: 'browseLocations', method: 'GET', path: '/api/locations/browse' },
  { name: 'getLocation', method: 'GET', path: '/api/locations/:locationId' },
  { name: 'nearestLocation', method: 'POST', path: '/api/locations/nearest' },
  { name: 'approximateLocation', method: 'GET', path: '/api/locations/approximate' },
  { name: 'getReaderPreference', method: 'GET', path: '/api/locations/preference' },
  { name: 'saveReaderPreference', method: 'PUT', path: '/api/locations/preference' },
  { name: 'getPublicArticleLocations', method: 'GET', path: '/api/locations/articles/:articleId/associations' },
  { name: 'getReviewArticleLocations', method: 'GET', path: '/api/locations/articles/:articleId/associations/review' },
  { name: 'saveArticleLocations', method: 'PUT', path: '/api/locations/articles/:articleId/associations' },
]

const LEVEL_BY_ID = Object.fromEntries(LEVELS.map((level) => [level.id, level]))

/** Code formats per level. Cities, districts and places use GeoNames IDs. */
const CODE_PATTERNS = {
  global: /^world$/,
  continent: /^\d{3}$/,
  subregion: /^\d{3}$/,
  country: /^[A-Z]{2}$/,
  admin_division: /^[A-Z]{2}-[A-Z0-9]{1,3}$/,
  city: /^\d+$/,
  district: /^\d+$/,
  place: /^\d+$/,
}

export function levelRank(levelId) {
  return LEVELS.findIndex((level) => level.id === levelId)
}

export function buildLocationId(levelId, code) {
  return `${LEVEL_BY_ID[levelId].prefix}:${code}`
}

/** Returns `{ level, code }` for a valid identifier, otherwise null. */
export function parseLocationId(locationId) {
  const match = /^([a-z]+):(.+)$/.exec(typeof locationId === 'string' ? locationId : '')
  if (!match) return null
  const level = LEVELS.find((entry) => entry.prefix === match[1])
  return level ? { level: level.id, code: match[2] } : null
}

export function precisionRank(precision) {
  return PRECISION_LEVELS.indexOf(precision)
}

/** The finest public precision allowed for a location level used in a relationship. */
export function maxPublicPrecisionFor(levelId, relationshipType) {
  const relationship = RELATIONSHIP_TYPES.find((entry) => entry.id === relationshipType)
  const level = LEVEL_BY_ID[levelId]
  if (!relationship || !level) return 'hidden'
  const levelCap = level.maxPublicPrecision
  const relationshipCap = relationship.maxPrecision
  return precisionRank(levelCap) <= precisionRank(relationshipCap) ? levelCap : relationshipCap
}

/** True when the code is a real ISO 3166-1 alpha-2 region known to ICU. */
export function isKnownCountryCode(code) {
  if (!/^[A-Z]{2}$/.test(code)) return false
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(code) !== code
  } catch {
    return false
  }
}

export function isValidTimezone(timeZone) {
  try {
    new Intl.DateTimeFormat('en', { timeZone })
    return true
  } catch {
    return false
  }
}

/** Coordinates are optional, but must be complete and in range. (0,0) is treated as a placeholder. */
export function validateCoordinates(latitude, longitude) {
  if (latitude == null && longitude == null) return []
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return ['coordinates need both latitude and longitude, or neither']
  }
  const errors = []
  if (latitude < -90 || latitude > 90) errors.push(`latitude ${latitude} is out of range`)
  if (longitude < -180 || longitude > 180) errors.push(`longitude ${longitude} is out of range`)
  if (latitude === 0 && longitude === 0) errors.push('(0,0) is a placeholder, not a real coordinate')
  return errors
}

function countryAncestor(record, byId) {
  let current = record
  const seen = new Set()
  while (current && current.level !== 'country') {
    if (!current.parent || seen.has(current.parent)) return null
    seen.add(current.parent)
    current = byId.get(current.parent)
  }
  return current ?? null
}

/** Validates one seed record against the set of records it can reference. */
export function validateLocationRecord(record, byId) {
  const errors = []
  const id = buildLocationId(record.level, record.code)
  if (!LEVEL_BY_ID[record.level]) return [`${record.code}: unknown level "${record.level}"`]
  if (!CODE_PATTERNS[record.level].test(String(record.code))) {
    errors.push(`${id}: code "${record.code}" does not match the ${record.level} format`)
  }
  if (typeof record.name !== 'string' || record.name.trim() === '') errors.push(`${id}: name is required`)
  if (!Array.isArray(record.aliases) || record.aliases.some((alias) => typeof alias !== 'string')) {
    errors.push(`${id}: aliases must be an array of strings`)
  }

  if (record.level === 'global') {
    if (record.parent !== null) errors.push(`${id}: global has no parent`)
  } else {
    const parent = record.parent ? byId.get(record.parent) : null
    if (!parent) {
      errors.push(`${id}: parent "${record.parent}" does not exist`)
    } else if (levelRank(parent.level) >= levelRank(record.level)) {
      errors.push(`${id}: parent ${record.parent} must be broader than ${record.level}`)
    }
  }

  if (record.level === 'country' && record.countryCode !== record.code) {
    errors.push(`${id}: countryCode must equal the country code`)
  }

  const needsCountry = levelRank(record.level) >= levelRank('country')
  if (needsCountry) {
    if (!isKnownCountryCode(record.countryCode ?? '')) {
      errors.push(`${id}: countryCode "${record.countryCode}" is not a known ISO 3166-1 alpha-2 code`)
    }
    const ancestor = countryAncestor(record, byId)
    if (ancestor && ancestor.code !== record.countryCode) {
      errors.push(`${id}: countryCode ${record.countryCode} does not match its parent country ${ancestor.code}`)
    }
  }

  if (record.level === 'admin_division' && !record.code.startsWith(`${record.countryCode}-`)) {
    errors.push(`${id}: ISO 3166-2 code must start with its country code ${record.countryCode}`)
  }

  if (record.timezone !== null && !isValidTimezone(record.timezone)) {
    errors.push(`${id}: timezone "${record.timezone}" is not recognised`)
  }
  errors.push(...validateCoordinates(record.latitude, record.longitude).map((message) => `${id}: ${message}`))
  return errors
}

/** Validates the seed file: unique identifiers, valid references, and attribution. */
export function validateSeed(seed) {
  const errors = []
  if (!seed || !Array.isArray(seed.locations)) return ['seed must contain a locations array']
  if (!seed.source?.attribution) errors.push('seed.source.attribution is required (CC BY attribution)')

  const byId = new Map()
  for (const record of seed.locations) {
    const id = LEVEL_BY_ID[record.level] ? buildLocationId(record.level, record.code) : `${record.code}`
    if (byId.has(id)) errors.push(`duplicate location ${id}`)
    byId.set(id, record)
  }

  for (const record of seed.locations) {
    errors.push(...validateLocationRecord(record, byId))
  }
  return errors
}

/**
 * Validates the article geographic associations for one article. The backend
 * applies the same rules, and the uniqueness rule is also enforced by a database index.
 *
 * @param {Array<{locationId: string, relationshipType: string, publicPrecision?: string, status?: string, confidence?: string}>} associations
 * @param {Map<string, {level: string}>} locationsById
 */
export function validateAssociations(associations, locationsById) {
  const errors = []
  const seen = new Set()
  const singularCounts = {}

  associations.forEach((association, index) => {
    const label = `association[${index}]`
    const relationship = RELATIONSHIP_TYPES.find((entry) => entry.id === association.relationshipType)
    if (!relationship) {
      errors.push(`${label}: unknown relationship type "${association.relationshipType}"`)
      return
    }

    const location = locationsById.get(association.locationId)
    if (!location) {
      errors.push(`${label}: location "${association.locationId}" does not exist`)
      return
    }

    const key = `${association.locationId}|${association.relationshipType}`
    if (seen.has(key)) errors.push(`${label}: duplicate ${association.relationshipType} association for ${association.locationId}`)
    seen.add(key)

    if (relationship.allowedLevels && !relationship.allowedLevels.includes(location.level)) {
      errors.push(`${label}: ${association.relationshipType} cannot use a ${location.level} location`)
    }

    const precision = association.publicPrecision ?? 'hidden'
    if (!PRECISION_LEVELS.includes(precision)) {
      errors.push(`${label}: unknown precision "${precision}"`)
    } else if (precisionRank(precision) > precisionRank(maxPublicPrecisionFor(location.level, association.relationshipType))) {
      errors.push(`${label}: precision ${precision} is finer than allowed for ${location.level} as ${association.relationshipType}`)
    }

    if (association.confidence !== undefined && !CONFIDENCE_LEVELS.includes(association.confidence)) {
      errors.push(`${label}: unknown confidence "${association.confidence}"`)
    }
    if (association.status !== undefined && !ASSOCIATION_STATUSES.includes(association.status)) {
      errors.push(`${label}: unknown status "${association.status}"`)
    }

    if (relationship.singular) singularCounts[relationship.id] = (singularCounts[relationship.id] ?? 0) + 1
  })

  for (const [type, count] of Object.entries(singularCounts)) {
    if (count > 1) errors.push(`at most one ${type} location is allowed per article (found ${count})`)
  }
  return errors
}

const sameList = (a, b) => JSON.stringify(a) === JSON.stringify(b)

/** Compares the contract JSON with this registry. Returns a list of drift errors. */
export function validateContract(contract) {
  const errors = []
  if (contract.resource !== 'global-location') errors.push('contract resource must be "global-location"')
  if (!sameList(contract.levels?.map((level) => ({ id: level.id, prefix: level.prefix, maxPublicPrecision: level.maxPublicPrecision })), LEVELS)) {
    errors.push('contract levels drift from lib/global-location.js LEVELS')
  }
  if (!sameList(contract.precisionLevels, PRECISION_LEVELS)) errors.push('contract precisionLevels drift from PRECISION_LEVELS')
  if (!sameList(contract.relationshipTypes, RELATIONSHIP_TYPES)) errors.push('contract relationshipTypes drift from RELATIONSHIP_TYPES')
  if (!sameList(contract.selectionMethods, SELECTION_METHODS)) errors.push('contract selectionMethods drift from SELECTION_METHODS')
  if (!sameList(contract.associationStatuses, ASSOCIATION_STATUSES)) errors.push('contract associationStatuses drift from ASSOCIATION_STATUSES')
  if (!sameList(contract.confidenceLevels, CONFIDENCE_LEVELS)) errors.push('contract confidenceLevels drift from CONFIDENCE_LEVELS')
  if (!sameList(contract.operations?.map(({ name, method, path: route }) => ({ name, method, path: route })), OPERATIONS)) {
    errors.push('contract operations drift from OPERATIONS')
  }
  return errors
}

export function readJsonFile(root, relativeFile) {
  return JSON.parse(fs.readFileSync(path.join(root, relativeFile), 'utf8'))
}

export function loadContract(root = PROJECT_ROOT) {
  return readJsonFile(root, CONTRACT_FILE)
}

export function loadSeed(root = PROJECT_ROOT) {
  return readJsonFile(root, SEED_FILE)
}

/**
 * Reports whether the existing header's Set Location control imports the generated
 * modal. The header is never patched automatically; this only reports the state.
 */
export function inspectHeaderIntegration(root = PROJECT_ROOT) {
  const file = path.join(root, HEADER_FILE)
  if (!fs.existsSync(file)) return { exists: false, wired: false, hasSetLocation: false }
  const source = fs.readFileSync(file, 'utf8')
  return {
    exists: true,
    wired: source.includes(`features/${FRONTEND_FEATURE.split('/')[1]}`),
    hasSetLocation: /Set Location/.test(source),
  }
}
