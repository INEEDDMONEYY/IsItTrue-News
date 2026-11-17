export const EDITORIAL_DEADLINE_DAYS = 30

/**
 * Deadline for an editorial workflow object (article or investigation).
 * Entering a new stage starts a fresh 30-day window from the current UTC day.
 * Staying in the same stage keeps the existing deadline so re-saving cannot extend it.
 */
export function resolveEditorialDeadline(input: {
  previousStage?: string | null
  previousDeadline?: Date | null
  nextStage: string
  now?: Date
}): Date {
  if (input.previousStage === input.nextStage && input.previousDeadline) {
    return input.previousDeadline
  }
  const now = input.now ?? new Date()
  const startOfUtcDay = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  return new Date(startOfUtcDay + EDITORIAL_DEADLINE_DAYS * 24 * 60 * 60 * 1000)
}
