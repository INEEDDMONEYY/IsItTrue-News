import { Link } from 'react-router-dom'
import { FolderLock } from 'lucide-react'
import { Spinner } from '@/components/ui/Spinner'
import { EvidenceCard } from './EvidenceCard'
import { usePublicEvidence } from '../hooks/usePublicEvidence'

interface EvidenceViewerProps {
  investigationId: string
}

/**
 * Reader-facing "Public evidence panel" embedded inside a published
 * investigation. Only ever renders sanitized, editor-approved evidence —
 * the raw Evidence Vault is a completely separate, author/editor-only
 * surface and is never reachable from here.
 */
export function EvidenceViewer({ investigationId }: EvidenceViewerProps) {
  const { evidence, isLoading } = usePublicEvidence(investigationId)

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    )
  }

  if (evidence.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-card-border bg-card px-6 py-10 text-center">
        <FolderLock className="h-6 w-6 text-card-text-dim" />
        <p className="text-sm text-card-text-muted">No public evidence has been released for this investigation yet.</p>
      </div>
    )
  }

  const lockedCount = evidence.filter((item) => item.locked).length

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-heading">Evidence</h2>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {evidence.map((item) => (
          <EvidenceCard key={item.id} evidence={item} />
        ))}
      </div>

      {lockedCount > 0 && (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-surface-2 px-6 py-6 text-center">
          <p className="text-sm font-semibold text-heading">
            {lockedCount} more evidence {lockedCount === 1 ? 'item is' : 'items are'} available to premium members
          </p>
          <Link
            to="/subscribe"
            className="mt-1 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-hover"
          >
            View plans & subscribe
          </Link>
        </div>
      )}
    </div>
  )
}
