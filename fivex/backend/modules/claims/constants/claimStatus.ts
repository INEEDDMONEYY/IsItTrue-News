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

// A claim is still "open" until an editor reaches a verdict on it.
export const OPEN_CLAIM_STATUSES: readonly ClaimStatus[] = ['unreviewed', 'in_review']

export const EVIDENCE_STATUSES = ['none', 'gathering', 'sufficient', 'insufficient', 'conflicting'] as const

export type EvidenceStatus = (typeof EVIDENCE_STATUSES)[number]

export function isOpenClaimStatus(status: ClaimStatus): boolean {
  return OPEN_CLAIM_STATUSES.includes(status)
}
