import { useState } from 'react'
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { locationsApi } from '../api/locations.api'
import { useLocationSearch } from '../hooks/useLocationSearch'
import {
  GLOBAL_LOCATION_ID,
  type AssociationInput,
  type AssociationStatus,
  type LocationLevel,
  type LocationView,
  type PublicPrecision,
  type RelationshipType,
  type ReviewAssociation,
} from '../types/location.types'

interface ArticleLocationsEditorProps {
  articleId: string
  /** Editors save approved associations and can mark them confirmed. Authors save proposals. */
  isEditor: boolean
}

const RELATIONSHIP_OPTIONS: { value: RelationshipType; label: string }[] = [
  { value: 'primary', label: 'Primary location' },
  { value: 'dateline', label: 'Dateline' },
  { value: 'event', label: 'Event location' },
  { value: 'coverage', label: 'Coverage' },
  { value: 'subject', label: 'Subject location' },
  { value: 'country', label: 'Country' },
  { value: 'region', label: 'Region' },
]

const PRECISION_OPTIONS: { value: PublicPrecision; label: string }[] = [
  { value: 'hidden', label: 'Hidden' },
  { value: 'region', label: 'Region' },
  { value: 'country', label: 'Country' },
  { value: 'subdivision', label: 'Region within country' },
  { value: 'city', label: 'City' },
]

/** Finest public precision per location level. Mirrors LEVEL_PRECISION_CAP in backend/modules/locations/constants.ts. */
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

function precisionOptionsFor(location: LocationView | undefined) {
  if (!location) return PRECISION_OPTIONS
  const cap = PRECISION_OPTIONS.findIndex((option) => option.value === LEVEL_PRECISION_CAP[location.level])
  return PRECISION_OPTIONS.slice(0, cap + 1)
}

const REGION_LEVELS: LocationLevel[] = ['global', 'continent', 'subregion']

const STATUS_LABELS: Record<AssociationStatus, string> = {
  proposed: 'Awaiting approval',
  approved: 'Approved',
  rejected: 'Rejected',
}

function reviewAssociationsQueryKey(articleId: string) {
  return ['locations', 'article-review', articleId] as const
}

function defaultsFor(location: LocationView): { relationshipType: RelationshipType; publicPrecision: PublicPrecision } {
  if (location.level === 'country') return { relationshipType: 'country', publicPrecision: 'country' }
  if (REGION_LEVELS.includes(location.level)) return { relationshipType: 'region', publicPrecision: 'region' }
  if (location.level === 'admin_division') return { relationshipType: 'coverage', publicPrecision: 'subdivision' }
  if (location.level === 'place') return { relationshipType: 'coverage', publicPrecision: 'hidden' }
  return { relationshipType: 'coverage', publicPrecision: 'city' }
}

function toInput(association: ReviewAssociation): AssociationInput {
  return {
    locationId: association.locationId,
    relationshipType: association.relationshipType,
    publicPrecision: association.publicPrecision,
    confidence: association.confidence,
  }
}

export function ArticleLocationsEditor({ articleId, isEditor }: ArticleLocationsEditorProps) {
  const { data, isPending, isError } = useQuery({
    queryKey: reviewAssociationsQueryKey(articleId),
    queryFn: () => locationsApi.getReviewAssociations(articleId),
  })

  if (isPending) return <p className="text-sm opacity-70">Loading locations...</p>
  if (isError) return <p className="text-sm text-red-600">Could not load geographic metadata.</p>

  return (
    <ArticleLocationsEditorBody
      key={JSON.stringify(data)}
      articleId={articleId}
      isEditor={isEditor}
      saved={data}
    />
  )
}

interface BodyProps {
  articleId: string
  isEditor: boolean
  saved: ReviewAssociation[]
}

function ArticleLocationsEditorBody({ articleId, isEditor, saved }: BodyProps) {
  const queryClient = useQueryClient()
  const [rows, setRows] = useState<AssociationInput[]>(() => saved.map(toInput))
  const [query, setQuery] = useState('')
  const search = useLocationSearch(query)

  const labelQueries = useQueries({
    queries: rows.map((row) => ({
      queryKey: ['locations', 'location', row.locationId],
      queryFn: () => locationsApi.getLocation(row.locationId),
      staleTime: Infinity,
    })),
  })
  const locations = new Map<string, LocationView>()
  rows.forEach((row, index) => {
    const location = labelQueries[index]?.data
    if (location) locations.set(row.locationId, location)
  })

  const savedStatus = new Map(saved.map((item) => [item.locationId, item.status]))
  const isDirty = JSON.stringify(rows) !== JSON.stringify(saved.map(toInput))

  const saveMutation = useMutation({
    mutationFn: () => locationsApi.saveAssociations(articleId, rows),
    onSuccess: (result) => {
      queryClient.setQueryData(reviewAssociationsQueryKey(articleId), result)
    },
  })

  function addLocation(location: LocationView) {
    queryClient.setQueryData(['locations', 'location', location.locationId], location)
    setRows((current) => {
      if (current.some((row) => row.locationId === location.locationId)) return current
      const defaults = defaultsFor(location)
      return [
        ...current,
        {
          locationId: location.locationId,
          relationshipType: defaults.relationshipType,
          publicPrecision: defaults.publicPrecision,
          confidence: isEditor ? 'confirmed' : 'uncertain',
        },
      ]
    })
    setQuery('')
  }

  function updateRow(locationId: string, patch: Partial<AssociationInput>) {
    setRows((current) => current.map((row) => (row.locationId === locationId ? { ...row, ...patch } : row)))
  }

  function removeRow(locationId: string) {
    setRows((current) => current.filter((row) => row.locationId !== locationId))
  }

  const addedIds = new Set(rows.map((row) => row.locationId))
  const visibleResults = search.status === 'ready'
    ? search.results.filter((location) => location.locationId !== GLOBAL_LOCATION_ID && !addedIds.has(location.locationId))
    : []

  const approvalSummary = saved.length === 0
    ? 'No locations attached yet.'
    : saved.every((item) => item.status === 'approved')
      ? 'Approved by an editor.'
      : saved.some((item) => item.status === 'proposed')
        ? 'Awaiting editor approval. Only approved locations appear on the public article.'
        : 'Some locations were rejected by an editor.'

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-current/20 p-4">
      <div>
        <h2 className="text-base font-semibold">Geographic locations</h2>
        <p className="text-xs opacity-70">{approvalSummary}</p>
      </div>

      {rows.length > 0 && (
        <ul className="flex flex-col gap-2">
          {rows.map((row) => {
            const location = locations.get(row.locationId)
            const status = savedStatus.get(row.locationId)
            return (
              <li key={row.locationId} className="flex flex-wrap items-center gap-2 rounded border border-current/20 p-2">
                <span className="min-w-0 flex-1 text-sm font-medium">
                  {location?.name ?? row.locationId}
                  {location && <span className="ml-1 text-xs opacity-60">({location.level.replace('_', ' ')})</span>}
                </span>
                <select
                  aria-label={`Relationship for ${location?.name ?? row.locationId}`}
                  className="rounded border px-2 py-1 text-xs"
                  value={row.relationshipType}
                  onChange={(event) => updateRow(row.locationId, { relationshipType: event.target.value as RelationshipType })}
                >
                  {RELATIONSHIP_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <select
                  aria-label={`Public precision for ${location?.name ?? row.locationId}`}
                  className="rounded border px-2 py-1 text-xs"
                  value={row.publicPrecision}
                  onChange={(event) => updateRow(row.locationId, { publicPrecision: event.target.value as PublicPrecision })}
                >
                  {precisionOptionsFor(location).map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                {isEditor && (
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={row.confidence === 'confirmed'}
                      onChange={(event) =>
                        updateRow(row.locationId, { confidence: event.target.checked ? 'confirmed' : 'uncertain' })
                      }
                    />
                    Confirmed
                  </label>
                )}
                {status && <span className="text-xs opacity-70">{STATUS_LABELS[status]}</span>}
                <button type="button" className="text-xs text-accent hover:underline" onClick={() => removeRow(row.locationId)}>
                  Remove
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <div className="flex flex-col gap-1">
        <label htmlFor={`location-search-${articleId}`} className="text-xs font-medium">
          Add a location
        </label>
        <input
          id={`location-search-${articleId}`}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search a city, region or country"
          className="w-full rounded border px-3 py-2 text-sm"
        />
        {search.status === 'loading' && <p className="text-xs opacity-70">Searching...</p>}
        {search.status === 'error' && <p className="text-xs text-red-600">Location search failed. Try again.</p>}
        {search.status === 'ready' && visibleResults.length === 0 && (
          <p className="text-xs opacity-70">No matching locations.</p>
        )}
        {visibleResults.length > 0 && (
          <ul className="flex flex-col gap-1">
            {visibleResults.map((location) => (
              <li key={location.locationId}>
                <button
                  type="button"
                  onClick={() => addLocation(location)}
                  className="w-full rounded px-2 py-1 text-left text-sm hover:bg-current/10"
                >
                  {location.name}
                  <span className="ml-1 text-xs opacity-60">({location.level.replace('_', ' ')})</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={!isDirty || saveMutation.isPending}
          onClick={() => saveMutation.mutate()}
          className="rounded bg-accent px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {saveMutation.isPending ? 'Saving...' : 'Save locations'}
        </button>
        {saveMutation.isError && (
          <p className="text-xs text-red-600">
            {getErrorMessage(saveMutation.error, 'Could not save locations.')}
          </p>
        )}
        {saveMutation.isSuccess && !isDirty && <p className="text-xs opacity-70">Locations saved.</p>}
      </div>
    </section>
  )
}
