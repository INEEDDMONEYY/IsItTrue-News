export type AdvertisementSectionStatus = 'connected' | 'partial' | 'local-only' | 'pending'

export interface AdvertisementSection {
  route: string
  title: string
  purpose: string
  status: AdvertisementSectionStatus
  missing: string[]
}

export const ADVERTISEMENT_SECTIONS: readonly AdvertisementSection[] = [
  {
    "route": "overview",
    "title": "Overview",
    "purpose": "Revenue, active campaigns, pending approvals, impressions, clicks",
    "status": "connected",
    "missing": []
  },
  {
    "route": "advertisers",
    "title": "Advertisers",
    "purpose": "Business accounts, contacts, billing details, advertiser status",
    "status": "connected",
    "missing": []
  },
  {
    "route": "campaigns",
    "title": "Campaigns",
    "purpose": "Campaign creation, management, targeting, dates, and budgets",
    "status": "partial",
    "missing": [
      "Admin create and edit of campaigns (campaign writes are advertiser-scoped)"
    ]
  },
  {
    "route": "ad-placements",
    "title": "Ad Placements",
    "purpose": "Manage Header, Selected Page, Sidepage, Newsletter, Footer",
    "status": "partial",
    "missing": [
      "Assigning campaigns or creatives to placements from admin (placement summaries are read-only)"
    ]
  },
  {
    "route": "banners",
    "title": "Banners",
    "purpose": "Upload, manage, preview, approve, and assign creative assets",
    "status": "partial",
    "missing": [
      "Creative asset upload and preview",
      "Approval state for banners",
      "Placement assignment for banners"
    ]
  },
  {
    "route": "promotional-referral-codes",
    "title": "Promotional Referral Codes",
    "purpose": "Promotional referral codes with reward, validity, redemption limits, campaign, and partner",
    "status": "partial",
    "missing": [
      "Redemption tracking for total and per-user limits",
      "Subscription plan catalog, campaign records, and partner records"
    ]
  },
  {
    "route": "scheduling",
    "title": "Scheduling",
    "purpose": "Campaign start/end dates, placement availability, reservations",
    "status": "partial",
    "missing": [
      "Placement reservations and availability holds (no reservation model exists)"
    ]
  },
  {
    "route": "approvals",
    "title": "Approvals",
    "purpose": "Review and approve advertisers, campaigns, and creative assets",
    "status": "partial",
    "missing": [
      "Creative asset approval (ad assets have no approval status)"
    ]
  },
  {
    "route": "analytics",
    "title": "Analytics",
    "purpose": "Impressions, clicks, CTR, campaign performance, revenue",
    "status": "partial",
    "missing": [
      "Payment revenue (no payment provider is connected; revenue shown is committed budget)"
    ]
  },
  {
    "route": "settings",
    "title": "Settings",
    "purpose": "Global rules, pricing, integrations, defaults, and permissions",
    "status": "partial",
    "missing": [
      "Editing pricing, ad rules, and defaults (values are read-only)",
      "Integration configuration"
    ]
  }
]

export function requireAdvertisementSection(route: string): AdvertisementSection {
  const section = ADVERTISEMENT_SECTIONS.find((item) => item.route === route)
  if (!section) throw new Error('Unknown advertisement section: ' + route)
  return section
}
