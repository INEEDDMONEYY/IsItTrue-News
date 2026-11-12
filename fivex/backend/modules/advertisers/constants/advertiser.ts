export const ADVERTISER_STATUSES = {
  // Registered, email not confirmed yet. Cannot sign in.
  PENDING: 'pending',
  ACTIVE: 'active',
  // Blocked by an administrator. Cannot sign in.
  SUSPENDED: 'suspended',
} as const

export type AdvertiserStatus = (typeof ADVERTISER_STATUSES)[keyof typeof ADVERTISER_STATUSES]

export const ALL_ADVERTISER_STATUSES = Object.values(ADVERTISER_STATUSES)

export const CAMPAIGN_STATUSES = {
  // Saved but never submitted. Never shown to readers.
  DRAFT: 'draft',
  PENDING_REVIEW: 'pending_review',
  ACTIVE: 'active',
  // Stopped by the advertiser; can be resumed without another review.
  PAUSED: 'paused',
  REJECTED: 'rejected',
  // Its end date has passed.
  COMPLETED: 'completed',
} as const

export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[keyof typeof CAMPAIGN_STATUSES]

export const ALL_CAMPAIGN_STATUSES = Object.values(CAMPAIGN_STATUSES)

// The budget of these is still committed (not yet spent out or abandoned).
export const COMMITTED_CAMPAIGN_STATUSES: CampaignStatus[] = [
  CAMPAIGN_STATUSES.PENDING_REVIEW,
  CAMPAIGN_STATUSES.ACTIVE,
  CAMPAIGN_STATUSES.PAUSED,
]

// The creative can be changed only while the campaign isn't live. Saving an edit sends it back through review.
export const EDITABLE_CAMPAIGN_STATUSES: CampaignStatus[] = [
  CAMPAIGN_STATUSES.DRAFT,
  CAMPAIGN_STATUSES.PENDING_REVIEW,
  CAMPAIGN_STATUSES.PAUSED,
  CAMPAIGN_STATUSES.REJECTED,
]

export const CAMPAIGN_PLACEMENTS = {
  HEADER: 'header',
  SELECTED_PAGE: 'selected_page',
  SIDEPAGE: 'sidepage',
  NEWSLETTER: 'newsletter',
  FOOTER: 'footer',
} as const

export type CampaignPlacement = (typeof CAMPAIGN_PLACEMENTS)[keyof typeof CAMPAIGN_PLACEMENTS]

export const ALL_CAMPAIGN_PLACEMENTS = Object.values(CAMPAIGN_PLACEMENTS)

// What each placement needs before it can be submitted. Banner placements are image-led; native placements are
// copy-led, so their image is optional.
export const PLACEMENT_REQUIREMENTS: Record<CampaignPlacement, { imageRequired: boolean; bodyRequired: boolean }> = {
  header: { imageRequired: true, bodyRequired: false },
  selected_page: { imageRequired: false, bodyRequired: true },
  sidepage: { imageRequired: true, bodyRequired: false },
  newsletter: { imageRequired: false, bodyRequired: true },
  footer: { imageRequired: true, bodyRequired: false },
}

// Site pages a "Selected Page" ad can be shown on. Each article category is chosen separately (see targetCategories).
export const AD_TARGET_PAGES = [
  'home',
  'for_you',
  'article',
  'fact_checks',
  'videos',
  'investigations',
  'local',
  'newsletter',
] as const

export type AdTargetPage = (typeof AD_TARGET_PAGES)[number]
