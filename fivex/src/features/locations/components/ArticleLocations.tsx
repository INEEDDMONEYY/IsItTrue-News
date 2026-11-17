import { useQuery } from '@tanstack/react-query'
import { locationsApi } from '../api/locations.api'
import type { RelationshipType } from '../types/location.types'

const RELATIONSHIP_LABELS: Record<RelationshipType, string> = {
  primary: 'Primary',
  dateline: 'Dateline',
  event: 'Event',
  coverage: 'Coverage',
  subject: 'Subject',
  country: 'Country',
  region: 'Region',
}

interface ArticleLocationsProps {
  articleId: string
}

/** Shows only approved public associations. Renders nothing when there are none. */
export function ArticleLocations({ articleId }: ArticleLocationsProps) {
  const { data } = useQuery({
    queryKey: ['locations', 'public-associations', articleId],
    queryFn: () => locationsApi.getPublicAssociations(articleId),
    enabled: Boolean(articleId),
    staleTime: 5 * 60 * 1000,
  })

  if (!data || data.length === 0) return null

  return (
    <section aria-label="Geographic locations" className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold text-heading">Locations covered</h2>
      <ul className="flex flex-wrap gap-2">
        {data.map((association) => (
          <li
            key={`${association.relationshipType}-${association.location.locationId}`}
            className="rounded-full border border-border px-3 py-1 text-xs text-text"
          >
            {association.location.name}
            <span className="ml-1 text-text-muted">· {RELATIONSHIP_LABELS[association.relationshipType]}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
