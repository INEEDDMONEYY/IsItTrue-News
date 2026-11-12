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
  PENDING_REVIEW: 'pending_review',
  ACTIVE: 'active',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
} as const

export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[keyof typeof CAMPAIGN_STATUSES]

export const ALL_CAMPAIGN_STATUSES = Object.values(CAMPAIGN_STATUSES)

export const CAMPAIGN_PLACEMENTS = {
  HOMEPAGE_FEATURE: 'homepage_feature',
  ARTICLE: 'article',
  SIDEBAR: 'sidebar',
} as const

export type CampaignPlacement = (typeof CAMPAIGN_PLACEMENTS)[keyof typeof CAMPAIGN_PLACEMENTS]

export const ALL_CAMPAIGN_PLACEMENTS = Object.values(CAMPAIGN_PLACEMENTS)
