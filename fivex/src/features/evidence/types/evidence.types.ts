export type EvidenceKind = 'document' | 'photo' | 'video' | 'note' | 'foia' | 'interview_transcript'

export type PublicEligibleEvidenceKind = 'document' | 'photo' | 'video'

export type EvidenceVisibility = 'private' | 'public'

/** Full vault record — author/collaborator/editor/admin only. */
export interface VaultEvidence {
  id: string
  investigation: string | { id: string; title: string; slug: string; status: string }
  uploadedBy: string
  kind: EvidenceKind
  visibility: EvidenceVisibility
  watermarked: boolean
  title: string
  description?: string
  url?: string
  thumbnailUrl?: string
  source?: string
  approvedBy?: string
  approvedAt?: string
  createdAt: string
  updatedAt: string
}

/** Sanitized, reader-facing evidence item — the Evidence Viewer. */
export interface PublicEvidenceItem {
  id: string
  kind: PublicEligibleEvidenceKind
  watermarked: boolean
  title: string
  description?: string
  url?: string
  thumbnailUrl?: string
  locked: boolean
}

export interface CreateEvidenceInput {
  kind: EvidenceKind
  title: string
  description?: string
  url?: string
  thumbnailUrl?: string
  source?: string
}

export type UpdateEvidenceInput = Partial<Pick<CreateEvidenceInput, 'title' | 'description' | 'source'>>
