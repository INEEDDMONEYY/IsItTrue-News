import { PageLoader } from '@/components/loaders/PageLoader'
import { useInvestigations } from '../hooks/useInvestigations'
import { InvestigationCard } from '../components/InvestigationCard'

export function InvestigationsPage() {
  const { investigations, isLoading } = useInvestigations()

  if (isLoading) {
    return <PageLoader label="Loading investigations..." />
  }

  return (
    <div className="py-6 md:py-10 flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-semibold text-heading">Investigations</h1>
        <p className="max-w-2xl text-sm text-text-muted">
          Long-form investigative reporting, backed by verified evidence and editorially reviewed
          before publication.
        </p>
      </div>

      {investigations.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-card-border bg-card px-6 py-16 text-center">
          <p className="text-sm text-card-text-muted">No investigations have been published yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {investigations.map((investigation) => (
            <InvestigationCard key={investigation.id} investigation={investigation} />
          ))}
        </div>
      )}
    </div>
  )
}
