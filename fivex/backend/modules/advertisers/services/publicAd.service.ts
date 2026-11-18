import { Types, type FilterQuery } from 'mongoose'
import { CAMPAIGN_PLACEMENTS, type AdTargetPage, type CampaignPlacement } from '../constants/advertiser.js'
import type { ICampaign } from '../models/Campaign.js'
import { campaignRepository } from '../repositories/campaign.repository.js'
import { PLACEMENT_SURFACES, sectionSlotFor } from '../constants/slots.js'

export interface PublicAd {
  campaignId: string
  placement: CampaignPlacement
  headline: string
  body: string
  ctaLabel: string
  destinationUrl: string
  imageUrl?: string
  advertiserName: string
}

export interface AdAudience {
  page?: AdTargetPage
  category?: string
}

// Per-page placements match the chosen pages or categories. A Section Ad matches the slot covering the page.
// Banners and newsletter ads run site-wide.
function audienceFilter(placement: CampaignPlacement, audience: AdAudience): FilterQuery<ICampaign> | null {
  if (placement === CAMPAIGN_PLACEMENTS.SECTION_AD) {
    const slot = sectionSlotFor(audience)
    return slot ? { sectionSlot: slot } : null
  }
  if (!PLACEMENT_SURFACES[placement].targeted) return {}

  const matches: FilterQuery<ICampaign>[] = []
  if (audience.page) matches.push({ targetPages: audience.page })
  if (audience.category) matches.push({ targetCategories: audience.category })
  return matches.length > 0 ? { $or: matches } : null
}

// A site-wide placement only has as many slots as its capacity. The earliest-starting live campaigns hold those slots,
// so anything beyond capacity never rotates in. Targeted placements are capped per page/category elsewhere.
function rotationPool<T extends { _id: Types.ObjectId; startDate: Date; placement: CampaignPlacement }>(
  placement: CampaignPlacement,
  campaigns: T[],
): T[] {
  const { capacity, targeted } = PLACEMENT_SURFACES[placement]
  if (targeted) return campaigns
  return [...campaigns]
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime() || String(a._id).localeCompare(String(b._id)))
    .slice(0, capacity)
}

export interface VendorListing {
  campaignId: string
  premium: boolean
  businessName: string
  logoUrl?: string
  website: string
  categories: string[]
  listingTitle: string
  listingDescription: string
  featuredProduct: string
  services: string
  socialLinks: Record<string, string>
}

export const publicAdService = {
  // Every live vendor listing, premium first. Each tier is capped at its slot capacity, as the ad slots are.
  async vendorListings(): Promise<VendorListing[]> {
    const placements = [CAMPAIGN_PLACEMENTS.PREMIUM_VENDOR_LISTING, CAMPAIGN_PLACEMENTS.VENDOR_LISTING]
    const live = await campaignRepository.findLiveVendors(placements, new Date())
    const tier = (placement: CampaignPlacement) =>
      rotationPool(
        placement,
        live.filter((c) => c.placement === placement && c.advertiser !== null),
      )

    return [...tier(CAMPAIGN_PLACEMENTS.PREMIUM_VENDOR_LISTING), ...tier(CAMPAIGN_PLACEMENTS.VENDOR_LISTING)].map(
      (campaign) => {
        const advertiser = campaign.advertiser!
        const profile = advertiser.profile ?? {}
        return {
          campaignId: String(campaign._id),
          premium: campaign.placement === CAMPAIGN_PLACEMENTS.PREMIUM_VENDOR_LISTING,
          businessName: advertiser.businessName,
          logoUrl: profile.logoUrl || undefined,
          website: profile.website ?? '',
          categories: profile.categories ?? [],
          listingTitle: profile.listingTitle ?? '',
          listingDescription: profile.listingDescription ?? '',
          featuredProduct: profile.featuredProduct ?? '',
          services: profile.services ?? '',
          socialLinks: profile.socialLinks ?? {},
        }
      },
    )
  },

  // Picks one live campaign at random so each page load rotates through the slot holders.
  async findAd(placement: CampaignPlacement, audience: AdAudience): Promise<PublicAd | null> {
    const filter = audienceFilter(placement, audience)
    if (!filter) return null

    const live = await campaignRepository.findLive({ placement, ...filter }, new Date())
    const campaigns = rotationPool(placement, live)
    if (campaigns.length === 0) return null

    const campaign = campaigns[Math.floor(Math.random() * campaigns.length)]
    const creative = campaign.creative ?? { headline: '', body: '', ctaLabel: '', destinationUrl: '' }
    return {
      campaignId: String(campaign._id),
      placement: campaign.placement,
      headline: creative.headline,
      body: creative.body,
      ctaLabel: creative.ctaLabel,
      destinationUrl: creative.destinationUrl,
      imageUrl: creative.imageUrl || undefined,
      advertiserName: campaign.advertiser?.businessName ?? '',
    }
  },

  // Each call counts one served impression. Only live campaigns count, so the request is a no-op otherwise.
  async recordImpression(campaignId: string): Promise<boolean> {
    return (await campaignRepository.incrementIfLive(campaignId, 'impressions', new Date())) !== null
  },

  // Returns where the click should go, or null when the campaign isn't live any more.
  async recordClick(campaignId: string): Promise<string | null> {
    const campaign = await campaignRepository.incrementIfLive(campaignId, 'clicks', new Date())
    return campaign?.destinationUrl || null
  },
}
