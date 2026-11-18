import type { CampaignPlacement } from './advertiser.js'

export const CAMPAIGN_DURATIONS = [7, 14, 30, 90, 180, 365] as const
export type CampaignDuration = (typeof CAMPAIGN_DURATIONS)[number]

// A newsletter buy is charged per send and runs for this many days from its start date.
export const NEWSLETTER_WINDOW_DAYS = 30
export const MAX_NEWSLETTER_SENDS = 12

export const PLACEMENT_LABELS: Record<CampaignPlacement, string> = {
  header: 'Header',
  selected_page: 'Category Sponsor',
  sidepage: 'Sidepage Ad',
  section_ad: 'Section Ad',
  newsletter: 'Newsletter',
  footer: 'Footer',
  vendor_listing: 'Vendor Listing',
  premium_vendor_listing: 'Premium Vendor Listing',
  homepage_sponsor: 'Homepage Sponsor',
  exclusive_homepage_sponsor: 'Exclusive Homepage Sponsor',
  newsletter_sponsor: 'Newsletter Sponsor',
  sponsored_article: 'Sponsored Article',
}

// All prices are in cents. These are monthly (30-day) list prices; other run lengths are prorated from them.
// Category Sponsor and Sidepage Ad are charged for each page chosen.
// Section Ad and Sidepage Ad rates are confirmed by the owner.
export const MONTHLY_RATES_CENTS = {
  header: 49900,
  selected_page: 19900,
  sidepage: 9900,
  section_ad: 24900,
  footer: 14900,
  vendor_listing: 4900,
  premium_vendor_listing: 9900,
  homepage_sponsor: 34900,
  exclusive_homepage_sponsor: 79900,
  newsletter_sponsor: 29900,
  sponsored_article: 24900,
} satisfies Record<Exclude<CampaignPlacement, 'newsletter'>, number>

export const NEWSLETTER_SEND_CENTS = 5000

// These placements are bought per page or category chosen. Bundles include a set number of pages.
export const PER_PAGE_PLACEMENTS: CampaignPlacement[] = ['selected_page', 'sidepage']

export function prorateCents(monthlyCents: number, days: number): number {
  return Math.round((monthlyCents * days) / 30)
}

export interface BundleDefinition {
  id: 'starter' | 'growth' | 'authority' | 'industry_partner'
  name: string
  tagline: string
  description: string
  // Monthly (30-day) price.
  priceCents: number
  recommended: boolean
  placements: CampaignPlacement[]
  // Category Sponsor pages included in the bundle price. Pages beyond this are charged at the Category Sponsor rate.
  categorySponsors: number
}

// Bundles are the only way to buy ads. Each bundle's contents and monthly price come from the advertiser offer.
export const BUNDLES: BundleDefinition[] = [
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'Entry-level bundle',
    description: 'Monthly campaign',
    priceCents: 29900,
    recommended: false,
    placements: ['footer', 'sidepage', 'vendor_listing', 'selected_page'],
    categorySponsors: 1,
  },
  {
    id: 'growth',
    name: 'Growth',
    tagline: 'Header-led visibility',
    description: 'Monthly campaign',
    priceCents: 59900,
    recommended: true,
    placements: ['header', 'vendor_listing', 'newsletter', 'selected_page', 'sidepage'],
    categorySponsors: 3,
  },
  {
    id: 'authority',
    name: 'Authority',
    tagline: 'Homepage and newsletter presence',
    description: 'Monthly campaign',
    priceCents: 99900,
    recommended: false,
    placements: [
      'homepage_sponsor',
      'newsletter_sponsor',
      'vendor_listing',
      'sponsored_article',
      'selected_page',
      'sidepage',
      'section_ad',
    ],
    categorySponsors: 6,
  },
  {
    id: 'industry_partner',
    name: 'Industry Partner',
    tagline: 'Full-page sponsorship',
    description: 'Monthly campaign',
    priceCents: 199900,
    recommended: false,
    placements: [
      'exclusive_homepage_sponsor',
      'newsletter_sponsor',
      'premium_vendor_listing',
      'sponsored_article',
      'selected_page',
      'sidepage',
      'section_ad',
    ],
    categorySponsors: 10,
  },
]

// Vendor Directory is a recurring subscription, separate from campaign bundles. Prices are in cents per month.
export type VendorPlanId = 'basic' | 'professional' | 'enterprise'

export interface VendorPlanDefinition {
  id: VendorPlanId
  name: string
  priceCents: number
  features: string[]
}

export const VENDOR_PLANS: VendorPlanDefinition[] = [
  {
    id: 'basic',
    name: 'Basic',
    priceCents: 2900,
    features: ['Listing', 'Website link'],
  },
  {
    id: 'professional',
    name: 'Professional',
    priceCents: 7900,
    features: ['Enhanced profile', 'Featured badge', 'Priority placement'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    priceCents: 19900,
    features: ['Top placement', 'Custom branding', 'Multiple links', 'Article discounts'],
  },
]
