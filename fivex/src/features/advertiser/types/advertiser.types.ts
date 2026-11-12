export type AdvertiserAccountStatus = 'pending' | 'active' | 'suspended'

export interface AdvertiserAddress {
  line1: string
  line2: string
  city: string
  region: string
  postalCode: string
  country: string
}

export interface AdvertiserProfile {
  contactName: string
  phone: string
  website: string
  industry: string
  description: string
  billingEmail: string
  logoUrl?: string
  address: AdvertiserAddress
}

export interface AdvertiserNotifications {
  campaignStatus: boolean
  weeklyReport: boolean
  billing: boolean
}

export interface AdvertiserAccount {
  id: string
  businessName: string
  email: string
  status: AdvertiserAccountStatus
  isEmailVerified: boolean
  profile?: AdvertiserProfile
  notifications?: AdvertiserNotifications
  createdAt?: string
}

export interface AdvertiserCredentials {
  email: string
  password: string
}

export interface AdvertiserRegistration {
  businessName: string
  email: string
  password: string
}

export type CampaignStatus = 'draft' | 'pending_review' | 'active' | 'paused' | 'rejected' | 'completed'

export type CampaignPlacement = 'header' | 'selected_page' | 'sidepage' | 'newsletter' | 'footer'

export type AdTargetPage =
  | 'home'
  | 'for_you'
  | 'article'
  | 'fact_checks'
  | 'videos'
  | 'investigations'
  | 'local'
  | 'newsletter'

export interface CampaignCreative {
  headline: string
  body: string
  ctaLabel: string
  destinationUrl: string
  imageUrl?: string
  imageAsset?: string
}

// Run length for single placements. Newsletter ignores it and runs for a 30-day window.
export type CampaignDuration = 7 | 30

export interface AdvertiserCampaign {
  id: string
  name: string
  placement: CampaignPlacement
  status: CampaignStatus
  creative?: CampaignCreative
  targetPages?: AdTargetPage[]
  targetCategories?: string[]
  // Money is in cents; format it with formatMoney. The server computes it from the pricing catalog.
  budgetCents: number
  durationDays?: CampaignDuration
  sends?: number
  bundleId?: string
  startDate?: string
  endDate?: string
  submittedAt?: string
  reviewNote?: string
  impressions: number
  clicks: number
  createdAt: string
  updatedAt: string
}

// What the create/edit form sends. Dates are YYYY-MM-DD.
export interface CampaignInput {
  name: string
  placement: CampaignPlacement
  creative: {
    headline: string
    body: string
    ctaLabel: string
    destinationUrl: string
    imageAssetId: string | null
  }
  targetPages: AdTargetPage[]
  // Category slugs. Each one is billed as one page.
  targetCategories: string[]
  durationDays: CampaignDuration
  sends: number
  startDate: string | null
  submit: boolean
}

// Each bundled placement gets its own image, keyed by placement id.
export interface BundleInput {
  bundleId: string
  name: string
  creative: Omit<CampaignInput['creative'], 'imageAssetId'>
  images: Partial<Record<CampaignPlacement, string | null>>
  targetPages: AdTargetPage[]
  targetCategories: string[]
  startDate: string | null
  submit: boolean
}

// Editing keeps the paid terms locked; only the name and creative can change.
export interface CampaignEditInput {
  name: string
  creative: CampaignInput['creative']
  submit: boolean
}

export interface PricingPlacement {
  placement: CampaignPlacement
  label: string
  unit: 'flat' | 'per_page' | 'per_send'
  // Keyed by run length in days. Newsletter uses the per-send price for both.
  prices: Record<CampaignDuration, number>
}

export interface PricingBundle {
  id: string
  name: string
  tagline: string
  description: string
  priceCents: number
  individualValueCents: number
  savingsCents: number
  recommended: boolean
  durationDays: 30
  placements: { placement: CampaignPlacement; label: string }[]
}

export interface PricingCatalog {
  placements: PricingPlacement[]
  bundles: PricingBundle[]
}

export interface AdAsset {
  id: string
  name: string
  url: string
  format: string
  bytes: number
  width?: number
  height?: number
  usedBy: number
  createdAt: string
}

export type AdvertiserActivityType = 'campaign' | 'approval' | 'billing' | 'review'

export interface AdvertiserActivity {
  id: string
  type: AdvertiserActivityType
  title: string
  description: string
  at: string
}

export interface AdvertiserOverview {
  stats: {
    totalImpressions: number
    totalClicks: number
    activeCampaigns: number
    pendingReview: number
  }
  campaigns: AdvertiserCampaign[]
  activity: AdvertiserActivity[]
}

export interface PerformanceRow {
  impressions: number
  clicks: number
  ctr: number
}

export interface AdvertiserAnalytics {
  totals: PerformanceRow & { campaigns: number; activeCampaigns: number }
  byPlacement: Array<PerformanceRow & { placement: CampaignPlacement; campaigns: number }>
  byStatus: Partial<Record<CampaignStatus, number>>
  campaigns: Array<
    PerformanceRow & {
      id: string
      name: string
      placement: CampaignPlacement
      status: CampaignStatus
      startDate: string | null
      endDate: string | null
    }
  >
}

export interface AdvertiserBilling {
  summary: {
    committedCents: number
    activeCents: number
    completedCents: number
    draftCents: number
  }
  ledger: Array<{
    id: string
    name: string
    placement: CampaignPlacement
    status: CampaignStatus
    budgetCents: number
    startDate: string | null
    endDate: string | null
    submittedAt: string | null
  }>
  invoices: never[]
  paymentsEnabled: boolean
}

export type UpdateProfileInput = { businessName: string } & Omit<AdvertiserProfile, 'logoUrl'>
