export const CLAIM_STATUSES = [
  'unreviewed',
  'in_review',
  'verified',
  'partially_supported',
  'disputed',
  'unverified',
  'unable_to_verify',
] as const

export type ClaimStatus = (typeof CLAIM_STATUSES)[number]

export const EVIDENCE_STATUSES = ['none', 'gathering', 'sufficient', 'insufficient', 'conflicting'] as const

export type EvidenceStatus = (typeof EVIDENCE_STATUSES)[number]

export const claimStatusLabels: Record<ClaimStatus, string> = {
  unreviewed: 'Unreviewed',
  in_review: 'In Review',
  verified: 'Verified',
  partially_supported: 'Partially Supported',
  disputed: 'Disputed',
  unverified: 'Unverified',
  unable_to_verify: 'Unable to Verify',
}

export const evidenceStatusLabels: Record<EvidenceStatus, string> = {
  none: 'No evidence yet',
  gathering: 'Gathering',
  sufficient: 'Sufficient',
  insufficient: 'Insufficient',
  conflicting: 'Conflicting',
}

export function isOpenClaim(status: ClaimStatus): boolean {
  return status === 'unreviewed' || status === 'in_review'
}

export interface ClaimPerson {
  id: string
  name?: string
}

export type ClaimWorkflow = 'unreviewed' | 'in_review' | 'returned' | 'escalated' | 'completed'
export type EvidenceStance = 'supporting' | 'contradicting' | 'context'
export type SourceReliability = 'high' | 'medium' | 'low' | 'unknown'

export const evidenceStanceLabels: Record<EvidenceStance, string> = {
  supporting: 'Supporting',
  contradicting: 'Contradicting',
  context: 'Context',
}

export const reliabilityLabels: Record<SourceReliability, string> = {
  high: 'High reliability',
  medium: 'Medium reliability',
  low: 'Low reliability',
  unknown: 'Reliability not assessed',
}

// A restricted item is hidden by an admin: only its place in the list is shown.
export interface ClaimEvidenceItem {
  id: string
  stance: EvidenceStance
  restricted: boolean
  title?: string
  url?: string
  citation?: string
  reliability?: SourceReliability
  reliabilityNote?: string
}

export interface Claim {
  id: string
  text: string
  // The combined status shown in the picker. It is derived from the two fields below.
  status: ClaimStatus
  workflowStatus: ClaimWorkflow
  evidenceStatus: EvidenceStatus
  evidenceSummary?: string
  sources: string[]
  // Why the conclusion was reached, once there is one.
  assessment?: { conclusion?: string; reasoning?: string; limitations?: string; uncertainty?: string }
  evidence: ClaimEvidenceItem[]
  // Set while an admin has sent it back, so the reviewer sees why.
  returnReason?: string
  evidenceFlag?: { reason: string; flaggedAt: string }
  article: { id: string; title: string; slug: string; status: string } | null
  assignee?: ClaimPerson | null
  createdBy?: ClaimPerson | null
  reviewedBy?: ClaimPerson | null
  reviewedAt?: string
  createdAt: string
  updatedAt: string
}

export type ArticleFactCheckState = 'none' | 'pending' | 'approved' | 'rejected'

export interface FactCheckArticle {
  id: string
  title: string
  slug: string
  status: 'pending_review' | 'published'
  factCheckStatus: ArticleFactCheckState
  factCheckRejectionReason?: string
  factCheckReviewedAt?: string
  factCheckReviewedBy?: { name?: string } | null
  author?: { name?: string } | null
  claimCounts: Partial<Record<ClaimStatus, number>>
  claimTotal: number
  openClaims: number
  updatedAt: string
}

export interface ClaimUpdate {
  text?: string
  status?: ClaimStatus
  evidenceStatus?: EvidenceStatus
  evidenceSummary?: string
  sources?: string[]
  conclusion?: string
  reasoning?: string
  limitations?: string
  uncertainty?: string
}

export interface NewEvidence {
  stance: EvidenceStance
  title: string
  url?: string
  citation?: string
  reliability: SourceReliability
  reliabilityNote?: string
}
