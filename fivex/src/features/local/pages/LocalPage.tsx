import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { MapPin } from 'lucide-react'
import dayjs from '@/lib/dayjs'
import { CategorySidebar } from '@/features/home/components/CategorySidebar'
import { AdSlot } from '@/features/ads/components/AdSlot'
import { LocationModal } from '@/features/locations/components/LocationModal'
import { useReaderLocation } from '@/features/locations/hooks/useReaderLocation'
import { locationsApi } from '@/features/locations/api/locations.api'
import { GLOBAL_LOCATION_ID, type DiscoveryItem } from '@/features/locations/types/location.types'
import { LOCAL_CATEGORIES } from '../data/mockLocal'

const MATCH_LABELS: Record<DiscoveryItem['matchLevel'], string> = {
  exact: 'Local',
  nested: 'Nearby',
  broader: 'Regional',
}

export function LocalPage() {
  const reader = useReaderLocation()
  const [locationOpen, setLocationOpen] = useState(false)
  const { preference, location, loadError } = reader
  const isGlobal = preference.locationId === GLOBAL_LOCATION_ID
  const locationId = location?.locationId ?? null

  const discovery = useQuery({
    queryKey: ['locations', 'discover', locationId],
    queryFn: () => locationsApi.discover(locationId!),
    enabled: Boolean(locationId),
  })

  return (
    <div className="py-6 md:py-10 flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-accent-bg flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-heading">Local</h1>
            <p className="text-sm text-text-muted">
              {location ? `News from around ${location.name}.` : 'Stories connected to your chosen location.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setLocationOpen(true)}
          className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg border border-border text-heading hover:border-accent-border hover:text-accent transition-colors">
          <MapPin className="w-4 h-4" />
          Change Location
        </button>
      </div>

      <AdSlot placement="header" page="local" />

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6 items-start">
        <CategorySidebar categories={LOCAL_CATEGORIES} />

        <div className="grid min-w-0 gap-6 xl:grid-cols-[1fr_300px] items-start">
          <LocalStories
            isGlobal={isGlobal}
            locationName={location?.name ?? null}
            isResolving={!isGlobal && !location && loadError === 'none'}
            isUnavailable={!isGlobal && !location && loadError === 'unavailable'}
            items={discovery.data}
            isPending={discovery.isPending && Boolean(locationId)}
            isError={discovery.isError}
            onChooseLocation={() => setLocationOpen(true)}
          />

          <aside className="xl:sticky xl:top-6">
            <AdSlot placement="sidepage" />
          </aside>
        </div>
      </div>

      <LocationModal open={locationOpen} onClose={() => setLocationOpen(false)} reader={reader} />
    </div>
  )
}

interface LocalStoriesProps {
  isGlobal: boolean
  locationName: string | null
  isResolving: boolean
  isUnavailable: boolean
  items: DiscoveryItem[] | undefined
  isPending: boolean
  isError: boolean
  onChooseLocation: () => void
}

function LocalStories({
  isGlobal,
  locationName,
  isResolving,
  isUnavailable,
  items,
  isPending,
  isError,
  onChooseLocation,
}: LocalStoriesProps) {
  const chooseButton = (
    <button type="button" onClick={onChooseLocation} className="self-start text-sm font-medium text-accent hover:underline">
      Choose a location
    </button>
  )

  if (isGlobal) {
    return (
      <Message title="Pick a location to see local news">
        Global is selected, so there is no local edition. Choose a city, region or country to see stories connected to it.
        {chooseButton}
      </Message>
    )
  }
  if (isResolving) return <Message title="Loading your location..." />
  if (isUnavailable) {
    return (
      <Message title="Your saved location is unavailable">
        Choose another location to see local news.
        {chooseButton}
      </Message>
    )
  }
  if (isPending) return <Message title="Loading local stories..." />
  if (isError) return <Message title="Local stories could not be loaded. Try again shortly." />
  if (!items || items.length === 0) {
    return <Message title={`No published stories for ${locationName ?? 'this location'} yet.`} />
  }

  return (
    <ul className="flex min-w-0 flex-col gap-4">
      {items.map((item) => (
        <li key={item.articleId}>
          <article className="flex flex-col gap-1 rounded-lg border border-border p-4">
            <p className="text-xs font-medium text-accent">
              {MATCH_LABELS[item.matchLevel]} · {item.matchedLocation.name}
            </p>
            <Link to={`/article/${item.slug}`} className="text-base font-semibold text-heading hover:underline">
              {item.title}
            </Link>
            {item.excerpt && <p className="text-sm text-text-muted">{item.excerpt}</p>}
            {item.publishedAt && (
              <time className="text-xs text-text-muted" dateTime={item.publishedAt}>
                {dayjs(item.publishedAt).format('MMM D, YYYY')}
              </time>
            )}
          </article>
        </li>
      ))}
    </ul>
  )
}

function Message({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border p-5">
      <h2 className="text-base font-semibold text-heading">{title}</h2>
      {children && <div className="flex flex-col gap-2 text-sm text-text-muted">{children}</div>}
    </div>
  )
}
