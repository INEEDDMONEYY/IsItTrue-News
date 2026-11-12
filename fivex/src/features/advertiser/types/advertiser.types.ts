export type AdvertiserAccountStatus = 'pending' | 'active' | 'suspended'

export interface AdvertiserAccount {
  id: string
  businessName: string
  email: string
  status: AdvertiserAccountStatus
  isEmailVerified: boolean
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

export type CampaignStatus = 'pending_review' | 'active' | 'rejected' | 'completed'

export type CampaignPlacement = 'homepage_feature' | 'article' | 'sidebar'

export interface AdvertiserCampaign {
  id: string
  name: string
  placement: CampaignPlacement
  status: CampaignStatus
  // Money is in cents; format it with formatMoney.
  budgetCents: number
  impressions: number
  clicks: number
  createdAt: string
  updatedAt: string
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
