import { AppError } from '../../../shared/errors/AppError.js'
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
