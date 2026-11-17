import { GLOBAL_PREFERENCE, type ReaderLocationPreference } from '../types/location.types'

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
