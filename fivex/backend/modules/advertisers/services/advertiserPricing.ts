import type { CampaignPlacement } from '../constants/advertiser.js'
import {
  BUNDLES,
  CAMPAIGN_RATES_CENTS,
  NEWSLETTER_SEND_CENTS,
  PLACEMENT_LABELS,
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

// Bundle values are always measured at the 30-day rate with one page and one send.
const BUNDLE_MEASURE: PlacementPriceOptions = { durationDays: 30, pages: 1, sends: 1 }

export function priceForPlacement(placement: CampaignPlacement, options: PlacementPriceOptions): number {
  if (placement === 'newsletter') return NEWSLETTER_SEND_CENTS * Math.max(1, options.sends ?? 1)
  const rate = CAMPAIGN_RATES_CENTS[placement][options.durationDays]
  if (placement === 'selected_page') return rate * Math.max(1, options.pages ?? 1)
  return rate
}

export function bundleIndividualValue(bundle: BundleDefinition): number {
  return bundle.placements.reduce((sum, placement) => sum + priceForPlacement(placement, BUNDLE_MEASURE), 0)
}

// Splits the bundle price across its placements in proportion to their individual value.
// Extra selected pages beyond the one included are charged at the per-page rate on the Selected Page item.
export function allocateBundle(bundle: BundleDefinition, pages: number): BundleItemPrice[] {
  const weights = bundle.placements.map((placement) => priceForPlacement(placement, BUNDLE_MEASURE))
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
  const lastIndex = bundle.placements.length - 1
  let remaining = bundle.priceCents

  const items = bundle.placements.map((placement, index) => {
    const share = index === lastIndex ? remaining : Math.round((bundle.priceCents * weights[index]) / totalWeight)
    remaining -= share
    return { placement, priceCents: share }
  })

  if (bundle.placements.includes('selected_page')) {
    const extraPages = Math.max(0, pages - 1)
    const selected = items.find((item) => item.placement === 'selected_page')
    if (selected) selected.priceCents += extraPages * CAMPAIGN_RATES_CENTS.selected_page[30]
  }

  return items
}

export function findBundle(id: string): BundleDefinition | undefined {
  return BUNDLES.find((bundle) => bundle.id === id)
}

export const pricingCatalog = {
  placements: (['header', 'selected_page', 'sidepage', 'footer', 'newsletter'] as CampaignPlacement[]).map((placement) => {
    if (placement === 'newsletter') {
      return {
        placement,
        label: PLACEMENT_LABELS[placement],
        unit: 'per_send' as const,
        prices: { 7: NEWSLETTER_SEND_CENTS, 30: NEWSLETTER_SEND_CENTS },
      }
    }
    return {
      placement,
      label: PLACEMENT_LABELS[placement],
      unit: placement === 'selected_page' ? ('per_page' as const) : ('flat' as const),
      prices: { 7: CAMPAIGN_RATES_CENTS[placement][7], 30: CAMPAIGN_RATES_CENTS[placement][30] },
    }
  }),

  bundles: BUNDLES.map((bundle) => {
    const individualValueCents = bundleIndividualValue(bundle)
    return {
      id: bundle.id,
      name: bundle.name,
      tagline: bundle.tagline,
      description: bundle.description,
      priceCents: bundle.priceCents,
      individualValueCents,
      savingsCents: individualValueCents - bundle.priceCents,
      recommended: bundle.recommended,
      durationDays: 30 as const,
      placements: bundle.placements.map((placement) => ({ placement, label: PLACEMENT_LABELS[placement] })),
    }
  }),
}
