import type { ClaimVerdict, PublicVerdict } from '../types/publicFactCheck.types'

export const VERDICT_LABELS: Record<PublicVerdict, string> = {
  verified: 'Verified True',
  partially_supported: 'Partially supported',
  disputed: 'Disputed',
  unverified: 'Unverified',
  unable_to_verify: 'Unable to verify',
  pending: 'Under Review',
}

// What each conclusion means, so a reader isn't left to guess. Two of them say outright that failing to confirm a
// claim is not the same as finding it false.
export const VERDICT_MEANINGS: Record<ClaimVerdict, string> = {
  verified: 'The evidence supports this claim.',
  partially_supported: 'Part of this claim holds up, and part of it does not or could not be shown.',
  disputed: 'The evidence contradicts this claim.',
  unverified: 'We could not confirm this claim. That is not a finding that it is false.',
  unable_to_verify:
    'The evidence needed to check this claim could not be found or reached. That is not a finding that it is false.',
}

export const FILTER_ORDER: ClaimVerdict[] = ['verified', 'partially_supported', 'disputed', 'unverified', 'unable_to_verify']

export const STANCE_LABELS = {
  supporting: 'Supporting evidence',
  contradicting: 'Contradicting evidence',
  context: 'Background and context',
} as const

export const RELIABILITY_LABELS = {
  high: 'High reliability',
  medium: 'Medium reliability',
  low: 'Low reliability',
  unknown: 'Reliability not assessed',
} as const

// Only web addresses become links. Anything else (javascript:, data:) is shown as plain text.
export function isSafeWebUrl(value: string | null | undefined): value is string {
  return Boolean(value && /^https?:\/\//i.test(value))
}

const pluralize = (count: number, singular: string) => `${count} ${singular}${count === 1 ? '' : 's'}`

// "3 claims checked: 2 verified, 1 disputed". Built from the real counts, never canned.
export function describeCounts(counts: Record<ClaimVerdict, number>): string {
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0)
  const parts = FILTER_ORDER.filter((verdict) => counts[verdict] > 0).map(
    (verdict) => `${counts[verdict]} ${VERDICT_LABELS[verdict].replace(' True', '').toLowerCase()}`,
  )
  return `${pluralize(total, 'claim')} checked${parts.length ? `: ${parts.join(', ')}` : ''}.`
}
