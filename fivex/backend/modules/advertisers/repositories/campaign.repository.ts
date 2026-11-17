import { Types, type FilterQuery, type UpdateQuery } from 'mongoose'
import { CAMPAIGN_STATUSES, COMMITTED_CAMPAIGN_STATUSES, type CampaignStatus } from '../constants/advertiser.js'
import { Campaign, type CampaignDocument, type ICampaign } from '../models/Campaign.js'

export interface CampaignTotals {
  totalImpressions: number
  totalClicks: number
  activeCampaigns: number
  pendingReview: number
}

export interface LiveCampaign {
  _id: Types.ObjectId
  placement: ICampaign['placement']
  creative: ICampaign['creative']
}

export interface CampaignListFilter {
  status?: CampaignStatus
  search?: string
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function toObjectId(id: string): Types.ObjectId {
  return new Types.ObjectId(id)
}

// Every query here is scoped to one advertiser: nobody can read or change another advertiser's campaigns.
export const campaignRepository = {
  async totalsFor(advertiserId: string): Promise<CampaignTotals> {
    const [row] = await Campaign.aggregate<CampaignTotals>([
      { $match: { advertiser: toObjectId(advertiserId) } },
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

  // Public serving: only approved campaigns whose run window includes `now`. Callers pass the placement/audience filter.
  async findLive(filter: FilterQuery<ICampaign>, now: Date): Promise<LiveCampaign[]> {
    return Campaign.find({
      ...filter,
      status: CAMPAIGN_STATUSES.ACTIVE,
      startDate: { $lte: now },
      endDate: { $gte: now },
    })
      .select('_id placement creative')
      .lean<LiveCampaign[]>()
  },

  // Increments a serving counter only while the campaign is live, so tracking can't inflate paused or ended ads.
  async incrementIfLive(
    id: string,
    counter: 'impressions' | 'clicks',
    now: Date,
  ): Promise<{ destinationUrl: string } | null> {
    const campaign = await Campaign.findOneAndUpdate(
      {
        _id: toObjectId(id),
        status: CAMPAIGN_STATUSES.ACTIVE,
        startDate: { $lte: now },
        endDate: { $gte: now },
      },
      { $inc: { [counter]: 1 } },
      { new: true },
    )
      .select('creative.destinationUrl')
      .lean<{ creative?: { destinationUrl?: string } }>()
    if (!campaign) return null
    return { destinationUrl: campaign.creative?.destinationUrl ?? '' }
  },

  // Campaigns whose last day is before `today` have finished, whether they were running or paused.
  async completeEnded(advertiserId: string, today: Date): Promise<void> {
    await Campaign.updateMany(
      {
        advertiser: advertiserId,
        status: { $in: [CAMPAIGN_STATUSES.ACTIVE, CAMPAIGN_STATUSES.PAUSED] },
        endDate: { $lt: today },
      },
      { $set: { status: CAMPAIGN_STATUSES.COMPLETED } },
    )
  },

  async list(advertiserId: string, filter: CampaignListFilter): Promise<CampaignDocument[]> {
    const query: FilterQuery<ICampaign> = { advertiser: advertiserId }
    if (filter.status) query.status = filter.status
    if (filter.search) {
      const pattern = new RegExp(escapeRegex(filter.search), 'i')
      query.$or = [{ name: pattern }, { 'creative.headline': pattern }]
    }
    return Campaign.find(query).sort({ updatedAt: -1 }).limit(500)
  },

  async findOwned(advertiserId: string, id: string): Promise<CampaignDocument | null> {
    return Campaign.findOne({ _id: id, advertiser: advertiserId })
  },

  async create(campaign: Partial<ICampaign>): Promise<CampaignDocument> {
    return Campaign.create(campaign)
  },

  async createMany(campaigns: Partial<ICampaign>[]): Promise<CampaignDocument[]> {
    return Campaign.create(campaigns)
  },

  // Applies the update only if the campaign is still in one of `fromStatuses`. Status check and write are one
  // operation, so two tabs (or a pause racing an edit) can't both win.
  async updateIfStatus(
    advertiserId: string,
    id: string,
    fromStatuses: CampaignStatus[],
    update: UpdateQuery<ICampaign>,
  ): Promise<CampaignDocument | null> {
    return Campaign.findOneAndUpdate(
      { _id: id, advertiser: advertiserId, status: { $in: fromStatuses } },
      update,
      { new: true, runValidators: true },
    )
  },

  async deleteIfStatus(advertiserId: string, id: string, fromStatuses: CampaignStatus[]): Promise<boolean> {
    const result = await Campaign.deleteOne({ _id: id, advertiser: advertiserId, status: { $in: fromStatuses } })
    return result.deletedCount === 1
  },

  async performance(advertiserId: string): Promise<CampaignDocument[]> {
    return Campaign.find({ advertiser: advertiserId, status: { $ne: CAMPAIGN_STATUSES.DRAFT } })
      .select('name placement status impressions clicks budgetCents startDate endDate updatedAt createdAt')
      .sort({ impressions: -1, updatedAt: -1 })
      .limit(500)
  },

  countByStatus(advertiserId: string, status: CampaignStatus): Promise<number> {
    return Campaign.countDocuments({ advertiser: advertiserId, status })
  },

  async budgetsByStatus(advertiserId: string): Promise<{ status: CampaignStatus; count: number; budgetCents: number }[]> {
    const rows = await Campaign.aggregate<{ _id: CampaignStatus; count: number; budgetCents: number }>([
      { $match: { advertiser: toObjectId(advertiserId) } },
      { $group: { _id: '$status', count: { $sum: 1 }, budgetCents: { $sum: '$budgetCents' } } },
    ])
    return rows.map((row) => ({ status: row._id, count: row.count, budgetCents: row.budgetCents }))
  },

  async findBillable(advertiserId: string): Promise<CampaignDocument[]> {
    return Campaign.find({ advertiser: advertiserId, status: { $ne: CAMPAIGN_STATUSES.DRAFT } })
      .select('name placement status budgetCents startDate endDate submittedAt updatedAt createdAt')
      .sort({ submittedAt: -1, createdAt: -1 })
      .limit(500)
  },

  async countLiveUsingAsset(advertiserId: string, assetId: string): Promise<number> {
    return Campaign.countDocuments({
      advertiser: advertiserId,
      'creative.imageAsset': assetId,
      status: { $in: COMMITTED_CAMPAIGN_STATUSES },
    })
  },

  // Detaches a deleted library image from campaigns that aren't live, so a later submit asks for a new one.
  async detachAsset(advertiserId: string, assetId: string): Promise<void> {
    await Campaign.updateMany(
      { advertiser: advertiserId, 'creative.imageAsset': assetId },
      { $unset: { 'creative.imageAsset': '', 'creative.imageUrl': '' } },
    )
  },

  async usageByAsset(advertiserId: string): Promise<Map<string, number>> {
    const rows = await Campaign.aggregate<{ _id: Types.ObjectId; count: number }>([
      { $match: { advertiser: toObjectId(advertiserId), 'creative.imageAsset': { $exists: true } } },
      { $group: { _id: '$creative.imageAsset', count: { $sum: 1 } } },
    ])
    return new Map(rows.map((row) => [String(row._id), row.count]))
  },
}
