import type { CampaignPlacement } from './advertiser.js'

export const CAMPAIGN_DURATIONS = [7, 30] as const
export type CampaignDuration = (typeof CAMPAIGN_DURATIONS)[number]

// A newsletter buy is charged per send and runs for this many days from its start date.
export const NEWSLETTER_WINDOW_DAYS = 30
export const MAX_NEWSLETTER_SENDS = 12

export const PLACEMENT_LABELS: Record<CampaignPlacement, string> = {
  header: 'Header',
  selected_page: 'Selected Page Ad',
  sidepage: 'Sidepage Ad',
  newsletter: 'Newsletter',
  footer: 'Footer',
}

// All prices are in cents. Selected Page is charged for each page chosen.
export const CAMPAIGN_RATES_CENTS = {
  header: { 7: 12500, 30: 26500 },
  selected_page: { 7: 6000, 30: 18000 },
  sidepage: { 7: 2500, 30: 7500 },
  footer: { 7: 3500, 30: 13500 },
} satisfies Record<Exclude<CampaignPlacement, 'newsletter'>, Record<CampaignDuration, number>>

export const NEWSLETTER_SEND_CENTS = 5000

export interface BundleDefinition {
  id: 'starter_visibility' | 'growth_campaign' | 'complete_exposure'
  name: string
  tagline: string
  description: string
  priceCents: number
  recommended: boolean
  placements: CampaignPlacement[]
}

// Bundles run for 30 days. They include one page for Selected Page Ad and one send for Newsletter.
export const BUNDLES: BundleDefinition[] = [
  {
    id: 'starter_visibility',
    name: 'Starter Visibility',
    tagline: 'Entry-level bundle',
    description: '30-day campaign · Individual purchase',
    priceCents: 13500,
    recommended: false,
    placements: ['selected_page', 'footer'],
  },
  {
    id: 'growth_campaign',
    name: 'Growth Campaign',
    tagline: 'Growth Campaign',
    description: '30-day campaign · Individual purchase',
    priceCents: 33500,
    recommended: true,
    placements: ['header', 'selected_page', 'sidepage'],
  },
  {
    id: 'complete_exposure',
    name: 'Complete Exposure',
    tagline: 'Full advertising package',
    description: '30-day campaign + one newsletter distribution',
    priceCents: 42500,
    recommended: false,
    placements: ['header', 'selected_page', 'sidepage', 'footer', 'newsletter'],
  },
]
