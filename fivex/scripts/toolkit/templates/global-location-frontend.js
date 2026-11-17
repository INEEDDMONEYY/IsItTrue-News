/**
 * Frontend files for the Global Location feature (src/features/locations).
 *
 * The header is not modified by this template. The modal is exported for the
 * existing Set Location control to use in the app phase.
 *
 * Content must not contain template literal syntax, because each file is a
 * String.raw block. Use string concatenation instead.
 */

const TYPES = String.raw`export type LocationLevel =
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
`

const API = String.raw`import { apiClient } from '@/api/client'
import type {
  AssociationInput,
  DiscoveryItem,
  LocationView,
  PublicAssociation,
  ReaderLocationPreference,
  ReviewAssociation,
} from '../types/location.types'

interface Envelope<T> {
  data: T
}

export const locationsApi = {
  async search(query: string, limit = 10): Promise<LocationView[]> {
    const { data } = await apiClient.get<Envelope<LocationView[]>>('/api/locations/search', {
      params: { q: query, limit },
    })
    return data.data
  },

  async browse(parentId?: string): Promise<LocationView[]> {
    const { data } = await apiClient.get<Envelope<LocationView[]>>('/api/locations/browse', {
      params: parentId ? { parent: parentId } : undefined,
    })
    return data.data
  },

  async getLocation(locationId: string): Promise<LocationView> {
    const { data } = await apiClient.get<Envelope<LocationView>>('/api/locations/' + encodeURIComponent(locationId))
    return data.data
  },

  async nearest(latitude: number, longitude: number): Promise<LocationView | null> {
    const { data } = await apiClient.post<Envelope<LocationView | null>>('/api/locations/nearest', {
      latitude,
      longitude,
    })
    return data.data
  },

  /** Country-level estimate. Returns 503 until a provider is configured. */
  async approximate(): Promise<LocationView> {
    const { data } = await apiClient.get<Envelope<LocationView>>('/api/locations/approximate')
    return data.data
  },

  async getPreference(): Promise<ReaderLocationPreference> {
    const { data } = await apiClient.get<Envelope<ReaderLocationPreference>>('/api/locations/preference')
    return data.data
  },

  async savePreference(preference: ReaderLocationPreference): Promise<ReaderLocationPreference> {
    const { data } = await apiClient.put<Envelope<ReaderLocationPreference>>('/api/locations/preference', preference)
    return data.data
  },

  async discover(locationId: string, limit = 20): Promise<DiscoveryItem[]> {
    const { data } = await apiClient.get<Envelope<DiscoveryItem[]>>('/api/locations/discover', {
      params: { locationId, limit },
    })
    return data.data
  },

  async getPublicAssociations(articleId: string): Promise<PublicAssociation[]> {
    const { data } = await apiClient.get<Envelope<PublicAssociation[]>>(
      '/api/locations/articles/' + encodeURIComponent(articleId) + '/associations',
    )
    return data.data
  },

  async getReviewAssociations(articleId: string): Promise<ReviewAssociation[]> {
    const { data } = await apiClient.get<Envelope<ReviewAssociation[]>>(
      '/api/locations/articles/' + encodeURIComponent(articleId) + '/associations/review',
    )
    return data.data
  },

  async saveAssociations(articleId: string, associations: AssociationInput[]): Promise<ReviewAssociation[]> {
    const { data } = await apiClient.put<Envelope<ReviewAssociation[]>>(
      '/api/locations/articles/' + encodeURIComponent(articleId) + '/associations',
      { associations },
    )
    return data.data
  },
}
`

const STORAGE = String.raw`import { GLOBAL_PREFERENCE, type ReaderLocationPreference } from '../types/location.types'

/** Anonymous readers keep their choice in this browser only. Coordinates are never stored. */
const STORAGE_KEY = 'iitnews.readerLocation'

export function readStoredLocation(): ReaderLocationPreference {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return GLOBAL_PREFERENCE
    const parsed = JSON.parse(raw) as Partial<ReaderLocationPreference>
    if (typeof parsed.locationId !== 'string' || typeof parsed.method !== 'string') return GLOBAL_PREFERENCE
    return { method: parsed.method as ReaderLocationPreference['method'], locationId: parsed.locationId }
  } catch {
    return GLOBAL_PREFERENCE
  }
}

export function writeStoredLocation(preference: ReaderLocationPreference): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preference))
  } catch {
    // Storage can be full or disabled. The selection still applies for this page view.
  }
}
`

const DEVICE = String.raw`export type DeviceLocationResult =
  | { status: 'ok'; latitude: number; longitude: number }
  | { status: 'denied' | 'unavailable' | 'timeout' | 'unsupported' }

/**
 * Asks for the device position once, after an explicit reader action.
 * It does not watch the position, and the caller must not store the coordinates.
 */
export function requestDeviceLocation(): Promise<DeviceLocationResult> {
  if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
    return Promise.resolve({ status: 'unsupported' })
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({ status: 'ok', latitude: position.coords.latitude, longitude: position.coords.longitude }),
      (error) => {
        if (error.code === error.PERMISSION_DENIED) resolve({ status: 'denied' })
        else if (error.code === error.TIMEOUT) resolve({ status: 'timeout' })
        else resolve({ status: 'unavailable' })
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    )
  })
}
`

const READER_HOOK = String.raw`import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/app/providers/AuthProvider'
import { locationsApi } from '../api/locations.api'
import { readStoredLocation, writeStoredLocation } from '../utils/readerLocationStorage'
import {
  GLOBAL_LOCATION_ID,
  GLOBAL_PREFERENCE,
  type LocationView,
  type ReaderLocationPreference,
} from '../types/location.types'

/**
 * Reader location preference. Authenticated readers sync to the server. Anonymous
 * readers use localStorage. A saved location that no longer exists falls back to Global.
 * Language, timezone and currency are never changed here.
 */
export function useReaderLocation() {
  const { isAuthenticated } = useAuth()
  const [preference, setPreference] = useState<ReaderLocationPreference>(readStoredLocation)
  const [location, setLocation] = useState<LocationView | null>(null)
  const [loadError, setLoadError] = useState<'none' | 'unavailable' | 'sync'>('none')

  useEffect(() => {
    if (!isAuthenticated) return
    let active = true
    locationsApi
      .getPreference()
      .then((saved) => {
        if (!active) return
        setPreference(saved)
        writeStoredLocation(saved)
      })
      .catch(() => {
        if (active) setLoadError('sync')
      })
    return () => {
      active = false
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (preference.locationId === GLOBAL_LOCATION_ID) return
    let active = true
    locationsApi
      .getLocation(preference.locationId)
      .then((found) => {
        if (!active) return
        setLocation(found)
        setLoadError('none')
      })
      .catch((error: { response?: { status?: number } }) => {
        if (!active) return
        if (error.response?.status === 404) {
          setPreference(GLOBAL_PREFERENCE)
          writeStoredLocation(GLOBAL_PREFERENCE)
        } else {
          setLoadError('unavailable')
        }
      })
    return () => {
      active = false
    }
  }, [preference.locationId])

  const choose = useCallback(
    async (next: ReaderLocationPreference): Promise<boolean> => {
      setPreference(next)
      writeStoredLocation(next)
      if (!isAuthenticated) return true
      try {
        await locationsApi.savePreference(next)
        setLoadError('none')
        return true
      } catch {
        setLoadError('sync')
        return false
      }
    },
    [isAuthenticated],
  )

  const isGlobal = preference.locationId === GLOBAL_LOCATION_ID
  return {
    preference,
    location: isGlobal ? null : location,
    loadError: isGlobal ? ('none' as const) : loadError,
    choose,
  }
}

export type ReaderLocation = ReturnType<typeof useReaderLocation>
`

const SEARCH_HOOK = String.raw`import { useEffect, useState } from 'react'
import { locationsApi } from '../api/locations.api'
import type { LocationView } from '../types/location.types'

const MIN_QUERY_LENGTH = 2
const DEBOUNCE_MS = 250

export function useLocationSearch(query: string) {
  const [results, setResults] = useState<LocationView[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')

  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < MIN_QUERY_LENGTH) return

    let active = true
    const timer = window.setTimeout(() => {
      setStatus('loading')
      locationsApi
        .search(trimmed)
        .then((items) => {
          if (!active) return
          setResults(items)
          setStatus('ready')
        })
        .catch(() => {
          if (active) setStatus('error')
        })
    }, DEBOUNCE_MS)

    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [query])

  if (query.trim().length < MIN_QUERY_LENGTH) {
    return { results: [] as LocationView[], status: 'idle' as const }
  }
  return { results, status }
}
`

const MODAL = String.raw`import { useEffect, useRef, useState } from 'react'
import { locationsApi } from '../api/locations.api'
import { useLocationSearch } from '../hooks/useLocationSearch'
import type { ReaderLocation } from '../hooks/useReaderLocation'
import { requestDeviceLocation, type DeviceLocationResult } from '../utils/deviceLocation'
import { GLOBAL_LOCATION_ID, type LocationView, type SelectionMethod } from '../types/location.types'

interface LocationModalProps {
  open: boolean
  onClose: () => void
  reader: ReaderLocation
}

type Notice = { tone: 'info' | 'error'; text: string } | null

const DEVICE_MESSAGES: Record<Exclude<DeviceLocationResult['status'], 'ok'>, string> = {
  denied: 'Location access was denied. You can still search for a place.',
  unavailable: 'Your device location is unavailable. You can still search for a place.',
  timeout: 'Finding your location took too long. Try again or search for a place.',
  unsupported: 'This browser cannot share device location. Search for a place instead.',
}

/**
 * Set Location modal. It is the reader's choice: search, device location (on request only),
 * an optional country estimate that the reader must confirm, or Global.
 */
export function LocationModal({ open, onClose, reader }: LocationModalProps) {
  const { preference, location, loadError, choose } = reader
  const [query, setQuery] = useState('')
  const [notice, setNotice] = useState<Notice>(null)
  const [busy, setBusy] = useState(false)
  const [estimate, setEstimate] = useState<LocationView | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { results, status } = useLocationSearch(query)

  useEffect(() => {
    if (!open) return
    inputRef.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const select = async (view: LocationView | null, method: SelectionMethod) => {
    const next =
      view === null ? { method: 'global' as const, locationId: GLOBAL_LOCATION_ID } : { method, locationId: view.locationId }
    const saved = await choose(next)
    setNotice(saved ? null : { tone: 'error', text: 'Saved on this device, but could not sync to your account.' })
    if (saved) onClose()
  }

  const chooseDeviceLocation = async () => {
    setBusy(true)
    setNotice(null)
    const result = await requestDeviceLocation()
    if (result.status !== 'ok') {
      setNotice({ tone: 'error', text: DEVICE_MESSAGES[result.status] })
      setBusy(false)
      return
    }
    try {
      const nearest = await locationsApi.nearest(result.latitude, result.longitude)
      if (nearest) await select(nearest, 'device')
      else setNotice({ tone: 'error', text: 'No matching place was found near you. Search for a place instead.' })
    } catch {
      setNotice({ tone: 'error', text: 'Could not look up your location. Try again later.' })
    } finally {
      setBusy(false)
    }
  }

  const estimateCountry = async () => {
    setBusy(true)
    setNotice(null)
    try {
      setEstimate(await locationsApi.approximate())
    } catch {
      setNotice({ tone: 'error', text: 'An approximate location is not available right now.' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="set-location-title" className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-24">
      <div className="w-full max-w-lg rounded-lg bg-white p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 id="set-location-title" className="text-lg font-semibold">Set location</h2>
          <button type="button" onClick={onClose} className="text-sm underline">Close</button>
        </div>

        <p className="mt-1 text-sm text-gray-600">
          Current: {location ? location.name + (location.countryCode ? ', ' + location.countryCode : '') : 'Global edition'}
        </p>
        {loadError === 'unavailable' && <p className="mt-1 text-sm text-amber-700">Your saved location is unavailable right now.</p>}

        <label className="mt-4 block text-sm font-medium" htmlFor="location-search">Search a city, region or country</label>
        <input
          id="location-search"
          ref={inputRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="mt-1 w-full rounded border px-3 py-2"
          placeholder="For example, Lagos"
          autoComplete="off"
        />

        <div className="mt-2 min-h-[3rem]" aria-live="polite">
          {status === 'loading' && <p className="text-sm text-gray-500">Searching...</p>}
          {status === 'error' && <p className="text-sm text-red-700">Search is unavailable. Try again.</p>}
          {status === 'ready' && results.length === 0 && <p className="text-sm text-gray-500">No places match that search.</p>}
          <ul className="divide-y">
            {results.map((item) => (
              <li key={item.locationId}>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void select(item, 'manual')}
                  className="flex w-full justify-between px-2 py-2 text-left hover:bg-gray-50"
                >
                  <span>{item.name}</span>
                  <span className="text-xs uppercase text-gray-500">{item.countryCode ?? item.level}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 space-y-2 border-t pt-4">
          <button type="button" disabled={busy} onClick={() => void select(null, 'global')} className="w-full rounded border px-3 py-2 text-left">
            Global edition (no local preference)
          </button>
          <button type="button" disabled={busy} onClick={() => void chooseDeviceLocation()} className="w-full rounded border px-3 py-2 text-left">
            Use my device location
          </button>
          <p className="text-xs text-gray-500">Your device location is used once to find the nearest place. It is not stored or tracked.</p>
          <button type="button" disabled={busy} onClick={() => void estimateCountry()} className="w-full rounded border px-3 py-2 text-left">
            Estimate my country from my connection
          </button>
          {estimate && (
            <div className="rounded bg-gray-50 p-3 text-sm">
              <p>Estimated: {estimate.name}. This is approximate and may be wrong.</p>
              <div className="mt-2 flex gap-2">
                <button type="button" onClick={() => void select(estimate, 'approximate')} className="rounded bg-black px-3 py-1 text-white">Use this</button>
                <button type="button" onClick={() => setEstimate(null)} className="rounded border px-3 py-1">Not me</button>
              </div>
            </div>
          )}
        </div>

        {notice && <p role="status" className={'mt-3 text-sm ' + (notice.tone === 'error' ? 'text-red-700' : 'text-gray-700')}>{notice.text}</p>}
        <p className="mt-3 text-xs text-gray-400">Current selection: {preference.method}</p>
      </div>
    </div>
  )
}
`

/** Relative paths under src/features/locations. */
export function locationFrontendFiles() {
  return {
    'types/location.types.ts': TYPES,
    'api/locations.api.ts': API,
    'utils/readerLocationStorage.ts': STORAGE,
    'utils/deviceLocation.ts': DEVICE,
    'hooks/useReaderLocation.ts': READER_HOOK,
    'hooks/useLocationSearch.ts': SEARCH_HOOK,
    'components/LocationModal.tsx': MODAL,
  }
}
