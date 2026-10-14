import type { VerificationStatus } from '@/shared/types/article.types'

// What a reviewer concluded about one claim. "Unverified" and "unable to verify" mean it could not be confirmed,
// which is not the same as having shown it false.
export type ClaimVerdict = 'verified' | 'partially_supported' | 'disputed' | 'unverified' | 'unable_to_verify'

// The verdict for a story as a whole, worked out from its claims. "pending" means claims are still being checked.
export type ArticleVerdict = 'verified' | 'partially_supported' | 'disputed' | 'unverified' | 'pending'

// Everything the verdict badge can show.
export type PublicVerdict = VerificationStatus | ClaimVerdict | ArticleVerdict

export const CLAIM_VERDICTS: ClaimVerdict[] = ['verified', 'partially_supported', 'disputed', 'unverified', 'unable_to_verify']

export interface PublicFactCheckSummary {
  id: string
  claim: string
  verdict: ClaimVerdict
  // The conclusion, or the start of the reasoning. null when the reviewer wrote neither.
  summary: string | null
  article: { title: string; slug: string; category: string }
  checkedBy: string | null
  checkedAt: string | null
  sourceCount: number
}

export interface PublicFactCheckList {
  factChecks: PublicFactCheckSummary[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  counts: Record<ClaimVerdict | 'all', number>
}

export interface PublicFactCheckListParams {
  verdict?: ClaimVerdict
  q?: string
  page: number
  pageSize: number
}

export type EvidenceStance = 'supporting' | 'contradicting' | 'context'
export type SourceReliability = 'high' | 'medium' | 'low' | 'unknown'

export interface PublicEvidenceItem {
  id: string
  stance: EvidenceStance
  title: string
  url: string | null
  citation: string | null
  reliability: SourceReliability
  reliabilityNote: string | null
}

export interface PublicFactCheck {
  id: string
  claim: string
  verdict: ClaimVerdict
  conclusion: string | null
  reasoning: string | null
  limitations: string | null
  uncertainty: string | null
  checkedBy: string | null
  checkedAt: string | null
  // Set when the conclusion was changed after it was first recorded.
  revisedAt: string | null
  article: { title: string; slug: string; category: string; publishedAt: string | null }
  sources: string[]
  evidence: PublicEvidenceItem[]
  corrections: { number: number; text: string; publishedAt: string }[]
}

export interface ArticleFactCheckClaim {
  id: string
  claim: string
  verdict: ClaimVerdict
  summary: string | null
  checkedBy: string | null
  checkedAt: string | null
}

// What the article page shows about a story's fact-checking.
export interface ArticleFactCheck {
  verdict: ArticleVerdict
  // An admin flagged the story during verification; its conclusions are held back until that is resolved.
  flagged: boolean
  claims: ArticleFactCheckClaim[]
  counts: Record<ClaimVerdict, number>
  // Claims still being checked. Only a number: their text isn't public until they have a conclusion.
  openClaims: number
  editorSignOff: { by: string | null; at: string } | null
}
