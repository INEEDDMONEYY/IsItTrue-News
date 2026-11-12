import type { FilterQuery } from 'mongoose'
import { CAMPAIGN_PLACEMENTS, type AdTargetPage, type CampaignPlacement } from '../constants/advertiser.js'
import type { ICampaign } from '../models/Campaign.js'
import { campaignRepository } from '../repositories/campaign.repository.js'

export interface PublicAd {
  campaignId: string
  placement: CampaignPlacement
  headline: string
  body: string
  ctaLabel: string
  destinationUrl: string
  imageUrl?: string
}

export interface AdAudience {
  page?: AdTargetPage
  category?: string
}

// Only the Selected Page placement is audience-targeted; banners and newsletter ads run site-wide.
function audienceFilter(placement: CampaignPlacement, audience: AdAudience): FilterQuery<ICampaign> | null {
  if (placement !== CAMPAIGN_PLACEMENTS.SELECTED_PAGE) return {}

  const matches: FilterQuery<ICampaign>[] = []
  if (audience.page) matches.push({ targetPages: audience.page })
  if (audience.category) matches.push({ targetCategories: audience.category })
  return matches.length > 0 ? { $or: matches } : null
}

export const publicAdService = {
  // Picks one live campaign at random so repeat visits rotate through the active advertisers.
  async findAd(placement: CampaignPlacement, audience: AdAudience): Promise<PublicAd | null> {
    const filter = audienceFilter(placement, audience)
    if (!filter) return null

    const campaigns = await campaignRepository.findLive({ placement, ...filter }, new Date())
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
