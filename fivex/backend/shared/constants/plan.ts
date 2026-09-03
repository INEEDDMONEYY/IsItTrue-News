// Stripe billing isn't wired up yet — these limits just drive the free-plan
// usage tracker shown in the reader dashboard sidebar and the content-gating
// logic in article/video services.
export const FREE_PLAN_LIMITS = {
  // Free-plan readers get 3 full article unlocks per month; headlines,
  // excerpts/summaries, author profiles, and comments are always unlimited.
  articlesPerMonth: 3,
  // Free-plan (and anonymous) viewers can only fully watch videos at or
  // under this length — short clips, key moments, and trailer-style
  // previews. Longer full videos require a premium plan.
  maxFreeVideoDurationSeconds: 60,
  // Free-plan readers get 10 searches per month; anonymous visitors can
  // search unlimited times but can't use filters or see premium result
  // types. Premium is unlimited with full filters.
  searchesPerMonth: 10,
  // Free-plan readers get 10 comments per month; premium is unlimited.
  commentsPerMonth: 10,
} as const

// Anonymous visitors get the same caps as free-plan readers here (unlike
// articles, where anonymous is more restricted) — investigations don't have
// a per-viewer unlock mechanic, just a flat "how much of this investigation
// is visible" cap per non-premium viewer.
export const INVESTIGATION_FREE_LIMITS = {
  // Timeline entries beyond this count are returned as locked (title only,
  // no description) for free/anonymous viewers.
  freeTimelineEntries: 3,
  // Public evidence items (documents/photos/videos) beyond this count are
  // returned as locked (title/thumbnail only, no url) for free/anonymous viewers.
  freeEvidenceItems: 2,
} as const
