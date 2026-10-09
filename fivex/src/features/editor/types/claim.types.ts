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

export interface Claim {
  id: string
  text: string
  status: ClaimStatus
  evidenceStatus: EvidenceStatus
  evidenceSummary?: string
  sources: string[]
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
}
