import { CAMPAIGN_STATUSES, type CampaignStatus } from '../constants/advertiser.js'
import type { CampaignDocument } from '../models/Campaign.js'
import { campaignRepository } from '../repositories/campaign.repository.js'
import { advertiserCampaignService } from './advertiserCampaign.service.js'

const RECENT_CAMPAIGNS = 4
const ACTIVITY_ITEMS = 6

export type ActivityType = 'campaign' | 'approval' | 'billing' | 'review'

interface ActivityItem {
  id: string
  type: ActivityType
  title: string
  description: string
  at: Date
}

// Activity is read off the campaigns' current state, so what is shown can never disagree with the campaigns.
function describe(campaign: CampaignDocument): Pick<ActivityItem, 'type' | 'title' | 'description'> {
  const byStatus: Record<CampaignStatus, Pick<ActivityItem, 'type' | 'title' | 'description'>> = {
    [CAMPAIGN_STATUSES.DRAFT]: {
      type: 'campaign',
      title: 'Draft saved',
      description: `${campaign.name} was saved as a draft.`,
    },
    [CAMPAIGN_STATUSES.PAUSED]: {
      type: 'campaign',
      title: 'Campaign paused',
      description: `${campaign.name} is paused.`,
    },
    [CAMPAIGN_STATUSES.PENDING_REVIEW]: {
      type: 'campaign',
      title: 'Campaign submitted',
      description: `${campaign.name} was submitted for review.`,
    },
    [CAMPAIGN_STATUSES.ACTIVE]: {
      type: 'approval',
      title: 'Campaign activated',
      description: `${campaign.name} is now active.`,
    },
    [CAMPAIGN_STATUSES.REJECTED]: {
      type: 'review',
      title: 'Campaign not approved',
      description: `${campaign.name} was not approved.`,
    },
    [CAMPAIGN_STATUSES.COMPLETED]: {
      type: 'campaign',
      title: 'Campaign completed',
      description: `${campaign.name} has finished running.`,
    },
  }
  return byStatus[campaign.status]
}

export const advertiserOverviewService = {
  // Keyed by sidebar path. Only rejected campaigns count, since they are the ones waiting on the advertiser to edit.
  async getNavCounts(advertiserId: string): Promise<Record<string, number>> {
    const rejected = await campaignRepository.countByStatus(advertiserId, CAMPAIGN_STATUSES.REJECTED)
    return { '/advertiser/campaigns': rejected }
  },

  async getOverview(advertiserId: string) {
    await advertiserCampaignService.completeEnded(advertiserId)
    const [stats, recent] = await Promise.all([
      campaignRepository.totalsFor(advertiserId),
      campaignRepository.findRecentFor(advertiserId, Math.max(RECENT_CAMPAIGNS, ACTIVITY_ITEMS)),
    ])

    const activity: ActivityItem[] = recent.slice(0, ACTIVITY_ITEMS).map((campaign) => ({
      id: String(campaign._id),
      at: campaign.updatedAt,
      ...describe(campaign),
    }))

    return {
      stats,
      campaigns: recent.slice(0, RECENT_CAMPAIGNS).map((campaign) => campaign.toJSON()),
      activity,
    }
  },
}
