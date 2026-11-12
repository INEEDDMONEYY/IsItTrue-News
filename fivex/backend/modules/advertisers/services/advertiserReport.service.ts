import {
  ALL_CAMPAIGN_PLACEMENTS,
  CAMPAIGN_STATUSES,
  COMMITTED_CAMPAIGN_STATUSES,
  type CampaignPlacement,
  type CampaignStatus,
} from '../constants/advertiser.js'
import { campaignRepository } from '../repositories/campaign.repository.js'
import { advertiserCampaignService } from './advertiserCampaign.service.js'

// Click-through rate as a percentage with two decimals; 0 when nothing has been shown yet.
function ctr(clicks: number, impressions: number): number {
  return impressions > 0 ? Math.round((clicks / impressions) * 10000) / 100 : 0
}

export const advertiserReportService = {
  // Everything is computed from the advertiser's own campaigns; nothing is estimated or invented.
  async analytics(advertiserId: string) {
    await advertiserCampaignService.completeEnded(advertiserId)
    const campaigns = await campaignRepository.performance(advertiserId)

    const byPlacement = new Map<CampaignPlacement, { campaigns: number; impressions: number; clicks: number }>(
      ALL_CAMPAIGN_PLACEMENTS.map((placement) => [placement, { campaigns: 0, impressions: 0, clicks: 0 }]),
    )
    const byStatus: Partial<Record<CampaignStatus, number>> = {}
    let impressions = 0
    let clicks = 0

    for (const campaign of campaigns) {
      impressions += campaign.impressions
      clicks += campaign.clicks
      byStatus[campaign.status] = (byStatus[campaign.status] ?? 0) + 1
      const bucket = byPlacement.get(campaign.placement)
      if (bucket) {
        bucket.campaigns += 1
        bucket.impressions += campaign.impressions
        bucket.clicks += campaign.clicks
      }
    }

    return {
      totals: {
        impressions,
        clicks,
        ctr: ctr(clicks, impressions),
        campaigns: campaigns.length,
        activeCampaigns: byStatus[CAMPAIGN_STATUSES.ACTIVE] ?? 0,
      },
      byPlacement: [...byPlacement.entries()].map(([placement, row]) => ({
        placement,
        ...row,
        ctr: ctr(row.clicks, row.impressions),
      })),
      byStatus,
      campaigns: campaigns.map((campaign) => ({
        id: String(campaign._id),
        name: campaign.name,
        placement: campaign.placement,
        status: campaign.status,
        impressions: campaign.impressions,
        clicks: campaign.clicks,
        ctr: ctr(campaign.clicks, campaign.impressions),
        startDate: campaign.startDate ?? null,
        endDate: campaign.endDate ?? null,
      })),
    }
  },

  // A ledger of what has been budgeted. There is no payment provider yet, so there are no charges or invoices to
  // report and none are made up.
  async billing(advertiserId: string) {
    await advertiserCampaignService.completeEnded(advertiserId)
    const [groups, campaigns] = await Promise.all([
      campaignRepository.budgetsByStatus(advertiserId),
      campaignRepository.findBillable(advertiserId),
    ])

    const sum = (statuses: CampaignStatus[]) =>
      groups.filter((group) => statuses.includes(group.status)).reduce((total, group) => total + group.budgetCents, 0)

    return {
      summary: {
        committedCents: sum(COMMITTED_CAMPAIGN_STATUSES),
        activeCents: sum([CAMPAIGN_STATUSES.ACTIVE]),
        completedCents: sum([CAMPAIGN_STATUSES.COMPLETED]),
        draftCents: sum([CAMPAIGN_STATUSES.DRAFT]),
      },
      ledger: campaigns.map((campaign) => ({
        id: String(campaign._id),
        name: campaign.name,
        placement: campaign.placement,
        status: campaign.status,
        budgetCents: campaign.budgetCents,
        startDate: campaign.startDate ?? null,
        endDate: campaign.endDate ?? null,
        submittedAt: campaign.submittedAt ?? null,
      })),
      invoices: [] as never[],
      paymentsEnabled: false,
    }
  },
}
