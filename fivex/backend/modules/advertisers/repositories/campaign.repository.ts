import { Types } from 'mongoose'
import { CAMPAIGN_STATUSES } from '../constants/advertiser.js'
import { Campaign, type CampaignDocument } from '../models/Campaign.js'

export interface CampaignTotals {
  totalImpressions: number
  totalClicks: number
  activeCampaigns: number
  pendingReview: number
}

export const campaignRepository = {
  // Every query here is scoped to one advertiser: nobody can read another advertiser's campaigns.
  async totalsFor(advertiserId: string): Promise<CampaignTotals> {
    const [row] = await Campaign.aggregate<{
      totalImpressions: number
      totalClicks: number
      activeCampaigns: number
      pendingReview: number
    }>([
      { $match: { advertiser: new Types.ObjectId(advertiserId) } },
      {
        $group: {
          _id: null,
          totalImpressions: { $sum: '$impressions' },
          totalClicks: { $sum: '$clicks' },
          activeCampaigns: { $sum: { $cond: [{ $eq: ['$status', CAMPAIGN_STATUSES.ACTIVE] }, 1, 0] } },
          pendingReview: { $sum: { $cond: [{ $eq: ['$status', CAMPAIGN_STATUSES.PENDING_REVIEW] }, 1, 0] } },
        },
      },
    ])

    return {
      totalImpressions: row?.totalImpressions ?? 0,
      totalClicks: row?.totalClicks ?? 0,
      activeCampaigns: row?.activeCampaigns ?? 0,
      pendingReview: row?.pendingReview ?? 0,
    }
  },

  async findRecentFor(advertiserId: string, limit: number): Promise<CampaignDocument[]> {
    return Campaign.find({ advertiser: advertiserId }).sort({ updatedAt: -1 }).limit(limit)
  },
}
