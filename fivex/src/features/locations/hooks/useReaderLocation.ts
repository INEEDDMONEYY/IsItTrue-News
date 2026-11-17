import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
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
 * One shared preference for the whole app. Every hook instance (header, Local page,
 * modal) reads it, so a choice made in one place reaches the others without a refresh.
 */
let sharedPreference: ReaderLocationPreference | null = null
const listeners = new Set<() => void>()

function getSharedPreference(): ReaderLocationPreference {
  sharedPreference ??= readStoredLocation()
  return sharedPreference
}

function subscribeToPreference(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function setSharedPreference(next: ReaderLocationPreference) {
  sharedPreference = next
  writeStoredLocation(next)
  listeners.forEach((listener) => listener())
}

/**
 * Reader location preference. Authenticated readers sync to the server. Anonymous
 * readers use localStorage. A saved location that no longer exists falls back to Global.
 * Language, timezone and currency are never changed here.
 */
export function useReaderLocation() {
  const { isAuthenticated } = useAuth()
  const preference = useSyncExternalStore(subscribeToPreference, getSharedPreference)
  const [location, setLocation] = useState<LocationView | null>(null)
  const [loadError, setLoadError] = useState<'none' | 'unavailable' | 'sync'>('none')

  useEffect(() => {
    if (!isAuthenticated) return
    let active = true
    locationsApi
      .getPreference()
      .then((saved) => {
        if (!active) return
        setSharedPreference(saved)
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
          setSharedPreference(GLOBAL_PREFERENCE)
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
      setSharedPreference(next)
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
  const isCurrentLocation = location?.locationId === preference.locationId
  return {
    preference,
    location: isGlobal || !isCurrentLocation ? null : location,
    loadError: isGlobal ? ('none' as const) : loadError,
    choose,
  }
}

export type ReaderLocation = ReturnType<typeof useReaderLocation>
