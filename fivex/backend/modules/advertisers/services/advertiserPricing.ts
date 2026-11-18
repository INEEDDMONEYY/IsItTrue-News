import type { CampaignPlacement } from '../constants/advertiser.js'
import {
  BUNDLES,
  CAMPAIGN_DURATIONS,
  MONTHLY_RATES_CENTS,
  NEWSLETTER_SEND_CENTS,
  PER_PAGE_PLACEMENTS,
  PLACEMENT_LABELS,
  prorateCents,
  type BundleDefinition,
  type CampaignDuration,
} from '../constants/pricing.js'

export interface PlacementPriceOptions {
  durationDays: CampaignDuration
  pages?: number
  sends?: number
}

export interface BundleItemPrice {
  placement: CampaignPlacement
  priceCents: number
}

// Bundle prices are monthly and prorated to the chosen duration.
export function priceForPlacement(placement: CampaignPlacement, options: PlacementPriceOptions): number {
  if (placement === 'newsletter') return NEWSLETTER_SEND_CENTS * Math.max(1, options.sends ?? 1)
  const rate = prorateCents(MONTHLY_RATES_CENTS[placement], options.durationDays)
  if (PER_PAGE_PLACEMENTS.includes(placement)) return rate * Math.max(1, options.pages ?? 1)
  return rate
}

export function bundlePriceCents(bundle: BundleDefinition, durationDays: CampaignDuration): number {
  return prorateCents(bundle.priceCents, durationDays)
}

export function bundleIndividualValue(bundle: BundleDefinition, durationDays: CampaignDuration): number {
  return bundle.placements.reduce(
    (sum, placement) => sum + priceForPlacement(placement, { durationDays, pages: 1, sends: 1 }),
    0,
  )
}

// Splits the bundle price across its placements in proportion to their individual value.
// Pages beyond the bundle's included Category Sponsor pages are charged at the prorated Category Sponsor rate.
export function allocateBundle(bundle: BundleDefinition, pages: number, durationDays: CampaignDuration): BundleItemPrice[] {
  const weights = bundle.placements.map((placement) => priceForPlacement(placement, { durationDays, pages: 1, sends: 1 }))
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
  const total = bundlePriceCents(bundle, durationDays)
  const lastIndex = bundle.placements.length - 1
  let remaining = total

  const items = bundle.placements.map((placement, index) => {
    const share = index === lastIndex ? remaining : Math.round((total * weights[index]) / totalWeight)
    remaining -= share
    return { placement, priceCents: share }
  })

  const extraPages = Math.max(0, pages - bundle.categorySponsors)
  for (const item of items) {
    if (!PER_PAGE_PLACEMENTS.includes(item.placement)) continue
    item.priceCents += extraPages * priceForPlacement(item.placement, { durationDays, pages: 1 })
  }

  return items
}

export function findBundle(id: string): BundleDefinition | undefined {
  return BUNDLES.find((bundle) => bundle.id === id)
}

const pricesByDuration = (fn: (days: CampaignDuration) => number): Record<CampaignDuration, number> =>
  Object.fromEntries(CAMPAIGN_DURATIONS.map((days) => [days, fn(days)])) as Record<CampaignDuration, number>

export const pricingCatalog = {
  durations: [...CAMPAIGN_DURATIONS],

  placements: (['header', 'selected_page', 'sidepage', 'section_ad', 'footer', 'newsletter'] as CampaignPlacement[]).map((placement) => {
    if (placement === 'newsletter') {
      return {
        placement,
        label: PLACEMENT_LABELS[placement],
        unit: 'per_send' as const,
        prices: pricesByDuration(() => NEWSLETTER_SEND_CENTS),
      }
    }
    return {
      placement,
      label: PLACEMENT_LABELS[placement],
      unit: PER_PAGE_PLACEMENTS.includes(placement) ? ('per_page' as const) : ('flat' as const),
      prices: pricesByDuration((days) => priceForPlacement(placement, { durationDays: days })),
    }
  }),

  bundles: BUNDLES.map((bundle) => ({
    id: bundle.id,
    name: bundle.name,
    tagline: bundle.tagline,
    description: bundle.description,
    recommended: bundle.recommended,
    categorySponsors: bundle.categorySponsors,
    monthlyPriceCents: bundle.priceCents,
    prices: pricesByDuration((days) => bundlePriceCents(bundle, days)),
    individualValues: pricesByDuration((days) => bundleIndividualValue(bundle, days)),
    placements: bundle.placements.map((placement) => ({
      placement,
      label: PER_PAGE_PLACEMENTS.includes(placement)
        ? `${bundle.categorySponsors} ${PLACEMENT_LABELS[placement]}`
        : PLACEMENT_LABELS[placement],
    })),
  })),
}
