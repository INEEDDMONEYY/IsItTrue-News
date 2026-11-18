import type { AdTargetPage, CampaignPlacement } from './advertiser.js'

// 'site' marks a placement that runs on every page, rather than on one page of the site.
export type SlotPage = AdTargetPage | 'site'

export const SLOT_PAGE_LABELS: Record<SlotPage, string> = {
  home: 'Home',
  for_you: 'For You',
  article: 'Article pages',
  fact_checks: 'Fact-checks',
  videos: 'Videos',
  investigations: 'Investigations',
  local: 'Local',
  newsletter: 'Newsletter',
  site: 'All pages',
}

// The five Section Ad slots. Each slot covers a group of pages, and the categories slot covers every article category.
export const SECTION_SLOTS = [
  { id: 'home_for_you', label: 'Home and For You', pages: ['home', 'for_you'] },
  { id: 'article_local', label: 'Article and Local', pages: ['article', 'local'] },
  { id: 'fact_checks_investigations', label: 'Fact-checks and Investigations', pages: ['fact_checks', 'investigations'] },
  { id: 'videos_newsletter', label: 'Videos and Newsletter', pages: ['videos', 'newsletter'] },
  { id: 'categories', label: 'Article categories', pages: [] },
] as const satisfies readonly { id: string; label: string; pages: readonly AdTargetPage[] }[]

export type SectionSlotId = (typeof SECTION_SLOTS)[number]['id']
export const SECTION_SLOT_IDS = SECTION_SLOTS.map((slot) => slot.id) as [SectionSlotId, ...SectionSlotId[]]

// The Section Ad slot that serves a page, or the categories slot for an article category. Null when nothing matches.
export function sectionSlotFor(audience: { page?: AdTargetPage; category?: string }): SectionSlotId | null {
  if (audience.category) return 'categories'
  if (!audience.page) return null
  return SECTION_SLOTS.find((slot) => (slot.pages as readonly AdTargetPage[]).includes(audience.page!))?.id ?? null
}

// Where each placement renders and how many campaigns can run there at once. Capacities are placeholders until
// the owner confirms them. A "targeted" placement (Category Sponsor, Sidepage Ad) only counts campaigns that chose that page.
export const PLACEMENT_SURFACES: Record<CampaignPlacement, { pages: SlotPage[]; capacity: number; targeted: boolean }> = {
  header: { pages: ['site'], capacity: 5, targeted: false },
  selected_page: { pages: ['home', 'for_you', 'fact_checks', 'newsletter'], capacity: 1, targeted: true },
  sidepage: { pages: ['home', 'for_you', 'fact_checks', 'local', 'newsletter', 'videos', 'investigations'], capacity: 1, targeted: true },
  section_ad: { pages: [], capacity: 1, targeted: false },
  newsletter: { pages: ['newsletter'], capacity: 1, targeted: false },
  footer: { pages: ['site'], capacity: 1, targeted: false },
  vendor_listing: { pages: ['home'], capacity: 3, targeted: false },
  premium_vendor_listing: { pages: ['home'], capacity: 1, targeted: false },
  homepage_sponsor: { pages: ['home'], capacity: 2, targeted: false },
  exclusive_homepage_sponsor: { pages: ['home'], capacity: 1, targeted: false },
  newsletter_sponsor: { pages: ['newsletter'], capacity: 1, targeted: false },
  sponsored_article: { pages: ['home'], capacity: 2, targeted: false },
}
