import { useEffect, useRef, useState } from 'react'
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
    <div role="dialog" aria-modal="true" aria-labelledby="set-location-title" className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 md:p-4 md:pt-24">
      <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-b-2xl bg-white p-5 shadow-xl md:max-h-none md:overflow-visible md:rounded-lg">
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
