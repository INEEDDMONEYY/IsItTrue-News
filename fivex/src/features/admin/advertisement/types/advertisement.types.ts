export type AdvertiserStatus = 'pending' | 'active' | 'suspended'

export type CampaignStatus = 'draft' | 'pending_review' | 'active' | 'paused' | 'rejected' | 'completed'

export type CampaignPlacement = 'header' | 'selected_page' | 'sidepage' | 'newsletter' | 'footer'

export interface AdvertisementTotals {
  count: number
  impressions: number
  clicks: number
  budgetCents: number
  ctr: number
}

export interface AdvertisementOverview {
  totals: AdvertisementTotals & {
    committedCents: number
    activeCampaigns: number
    pendingApprovals: number
  }
  campaignsByStatus: Partial<Record<CampaignStatus, number>>
  advertisersByStatus: Partial<Record<AdvertiserStatus, number>>
  paymentsEnabled: boolean
}

export interface AdvertiserRow {
  id: string
  businessName: string
  email: string
  billingEmail: string
  status: AdvertiserStatus
  isEmailVerified: boolean
  lastLoginAt: string | null
  createdAt: string
}

export interface AdvertiserStatusResult {
  message: string
  advertiser: AdvertiserRow
  previousStatus: AdvertiserStatus
  pausedCampaigns: number
}

export interface CampaignRow {
  id: string
  name: string
  placement: CampaignPlacement
  placementLabel: string
  status: CampaignStatus
  headline: string
  imageUrl: string | null
  budgetCents: number
  durationDays: number
  impressions: number
  clicks: number
  ctr: number
  startDate: string | null
  endDate: string | null
  submittedAt: string | null
  reviewedAt: string | null
  reviewNote: string | null
  advertiser: { id: string; businessName: string; email: string } | null
}

export interface PlacementSummary {
  placement: CampaignPlacement
  label: string
  requirements: { imageRequired: boolean; bodyRequired: boolean }
  liveCampaigns: number
  pendingCampaigns: number
  count: number
  impressions: number
  clicks: number
  budgetCents: number
  ctr: number
}

export interface AnalyticsSummary {
  totals: AdvertisementTotals & { committedCents: number }
  byStatus: Partial<Record<CampaignStatus, number>>
  byPlacement: Array<AdvertisementTotals & { placement: CampaignPlacement; label: string }>
}

export interface AdvertisementSettings {
  campaignDurations: number[]
  rates: Record<Exclude<CampaignPlacement, 'newsletter'>, Record<'7' | '30', number>>
  newsletter: { sendCents: number; windowDays: number; maxSends: number }
  bundles: Array<{
    id: string
    name: string
    tagline: string
    description: string
    priceCents: number
    recommended: boolean
    placements: CampaignPlacement[]
  }>
  placementLabels: Record<CampaignPlacement, string>
  placementRequirements: Record<CampaignPlacement, { imageRequired: boolean; bodyRequired: boolean }>
  autoApproveCampaigns: boolean
}
