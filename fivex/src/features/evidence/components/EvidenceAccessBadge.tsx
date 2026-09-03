import { FileCheck2 } from 'lucide-react'
import type { PublicEvidenceItem } from '../types/evidence.types'

interface EvidenceAccessBadgeProps {
  evidence: Pick<PublicEvidenceItem, 'watermarked' | 'locked'>
}

/**
 * Small badge shown on every reader-facing evidence card — communicates
 * that the item has been editor-verified/watermarked, or that it's a
 * premium-only teaser. Never shown in the private vault (that view has no
 * concept of "approved for public").
 */
export function EvidenceAccessBadge({ evidence }: EvidenceAccessBadgeProps) {
  if (evidence.locked) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-text-muted">
        Premium
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-verified/30 bg-verified/10 px-2 py-0.5 text-[11px] font-medium text-verified">
      <FileCheck2 className="h-3 w-3" />
      {evidence.watermarked ? 'Verified · Watermarked' : 'Verified'}
    </span>
  )
}
