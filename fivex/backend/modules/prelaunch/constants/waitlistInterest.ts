export const WAITLIST_INTERESTS = ['reader', 'author', 'editor', 'organization'] as const

export type WaitlistInterest = (typeof WAITLIST_INTERESTS)[number]
