import type { FilterQuery } from 'mongoose'
import { Advertiser, type IAdvertiser } from '../../advertisers/models/Advertiser.js'
import { Campaign, type CampaignDocument, type ICampaign } from '../../advertisers/models/Campaign.js'
import type { AdvertiserStatus, CampaignStatus } from '../../advertisers/constants/advertiser.js'

export const ADMIN_LIST_LIMIT = 200

export interface AdvertiserLeanRow {
  _id: unknown
  businessName: string
  email: string
  billingEmail?: string
  status: AdvertiserStatus
  isEmailVerified: boolean
  lastLoginAt?: Date
  createdAt: Date
}

export interface CampaignLeanRow {
  _id: unknown
  name: string
  placement: ICampaign['placement']
  status: CampaignStatus
  creative: ICampaign['creative']
  budgetCents: number
  durationDays: number
  impressions: number
  clicks: number
  startDate?: Date
  endDate?: Date
  submittedAt?: Date
  reviewedAt?: Date
  reviewNote?: string
  updatedAt: Date
  advertiser: { _id: unknown; businessName: string; email: string } | null
}

export interface GroupTotal {
  count: number
  impressions: number
  clicks: number
  budgetCents: number
}

export const adminAdvertisementRepository = {
  // Campaigns whose end date has passed are closed here, the same way the advertiser side does it.
  async completeEnded(today: Date): Promise<void> {
    await Campaign.updateMany(
      { status: { $in: ['active', 'paused'] }, endDate: { $lt: today } },
      { $set: { status: 'completed' } },
    )
  },

  async countAdvertisersByStatus(): Promise<Array<{ _id: AdvertiserStatus; count: number }>> {
    return Advertiser.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }])
  },

  async findAdvertisers(status?: AdvertiserStatus): Promise<AdvertiserLeanRow[]> {
    return Advertiser.find(status ? { status } : {})
      .select('businessName email billingEmail status isEmailVerified lastLoginAt createdAt')
      .sort({ createdAt: -1 })
      .limit(ADMIN_LIST_LIMIT)
      .lean<AdvertiserLeanRow[]>()
  },

  async findAdvertiserById(id: string) {
    return Advertiser.findById(id)
  },

  async setAdvertiserStatus(id: string, status: IAdvertiser['status']) {
    return Advertiser.findByIdAndUpdate(id, { status }, { new: true })
  },

  async groupCampaignsByStatus(): Promise<Array<GroupTotal & { _id: CampaignStatus }>> {
    return Campaign.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          impressions: { $sum: '$impressions' },
          clicks: { $sum: '$clicks' },
          budgetCents: { $sum: '$budgetCents' },
        },
      },
    ])
  },

  async groupCampaignsByPlacement(): Promise<Array<GroupTotal & { _id: { placement: string; status: CampaignStatus } }>> {
    return Campaign.aggregate([
      {
        $group: {
          _id: { placement: '$placement', status: '$status' },
          count: { $sum: 1 },
          impressions: { $sum: '$impressions' },
          clicks: { $sum: '$clicks' },
          budgetCents: { $sum: '$budgetCents' },
        },
      },
    ])
  },

  async listCampaigns(query: FilterQuery<ICampaign>, sort: Record<string, 1 | -1>): Promise<CampaignLeanRow[]> {
    return Campaign.find(query)
      .populate('advertiser', 'businessName email')
      .sort(sort)
      .limit(ADMIN_LIST_LIMIT)
      .lean<CampaignLeanRow[]>()
  },

  async findCampaignById(id: string): Promise<CampaignDocument | null> {
    return Campaign.findById(id)
  },

  async pauseActiveCampaigns(advertiserId: string): Promise<number> {
    const result = await Campaign.updateMany(
      { advertiser: advertiserId, status: 'active' },
      { $set: { status: 'paused' } },
    )
    return result.modifiedCount
  },

  // Changes status only if the campaign is still in one of the allowed states, so two admins cannot both act on it.
  async transitionCampaign(
    id: string,
    from: CampaignStatus[],
    update: { $set: Partial<ICampaign>; $unset?: Record<string, 1> },
  ): Promise<CampaignDocument | null> {
    return Campaign.findOneAndUpdate({ _id: id, status: { $in: from } }, update, { new: true })
  },
}
