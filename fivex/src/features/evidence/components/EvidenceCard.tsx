import { FileText, Image as ImageIcon, Lock, Video } from 'lucide-react'
import { EvidenceAccessBadge } from './EvidenceAccessBadge'
import type { PublicEvidenceItem } from '../types/evidence.types'

interface EvidenceCardProps {
  evidence: PublicEvidenceItem
}

const KIND_ICONS = {
  document: FileText,
  photo: ImageIcon,
  video: Video,
} as const

/**
 * A single reader-facing evidence item. Locked items (beyond the free-tier
 * cap) never receive a `url` from the backend, so there is nothing to
 * accidentally leak client-side — the blur/lock UI here is purely cosmetic.
 */
export function EvidenceCard({ evidence }: EvidenceCardProps) {
  const Icon = KIND_ICONS[evidence.kind] ?? FileText

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-card-border bg-card">
      <div className="relative aspect-[4/3] bg-card-2">
        {evidence.locked ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-card-text-dim">
            <Lock className="h-6 w-6" />
            <span className="text-xs font-medium">Premium only</span>
          </div>
        ) : evidence.thumbnailUrl || evidence.url ? (
          <img
            src={evidence.thumbnailUrl || evidence.url}
            alt={evidence.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-card-text-dim">
            <Icon className="h-8 w-8" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <EvidenceAccessBadge evidence={evidence} />
        <p className="text-sm font-semibold text-card-heading">{evidence.title}</p>
        {!evidence.locked && evidence.description && (
          <p className="text-xs text-card-text-muted line-clamp-3">{evidence.description}</p>
        )}
        {!evidence.locked && evidence.url && (
          <a
            href={evidence.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto text-xs font-medium text-accent hover:underline"
          >
            View full document
          </a>
        )}
      </div>
    </div>
  )
}
