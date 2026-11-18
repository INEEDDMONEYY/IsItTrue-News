import { AppError } from '../../../shared/errors/AppError.js'
import { env } from '../../../config/env.js'
import {
  ADVERTISER_STATUSES,
  ALL_CAMPAIGN_PLACEMENTS,
  CAMPAIGN_STATUSES,
  COMMITTED_CAMPAIGN_STATUSES,
  PLACEMENT_REQUIREMENTS,
  type AdvertiserStatus,
  type CampaignPlacement,
  type CampaignStatus,
} from '../../advertisers/constants/advertiser.js'
import {
  BUNDLES,
  CAMPAIGN_DURATIONS,
  MAX_NEWSLETTER_SENDS,
  NEWSLETTER_SEND_CENTS,
  NEWSLETTER_WINDOW_DAYS,
  PLACEMENT_LABELS,
} from '../../advertisers/constants/pricing.js'
import { ctr } from '../../advertisers/services/advertiserReport.service.js'
import { pricingCatalog } from '../../advertisers/services/advertiserPricing.js'
import {
  adminAdvertisementRepository,
  type AdvertiserLeanRow,
  type CampaignLeanRow,
  type GroupTotal,
} from '../repositories/advertisement.repository.js'

const SCHEDULED_STATUSES: CampaignStatus[] = [
  CAMPAIGN_STATUSES.PENDING_REVIEW,
  CAMPAIGN_STATUSES.ACTIVE,
  CAMPAIGN_STATUSES.PAUSED,
  CAMPAIGN_STATUSES.COMPLETED,
]

function startOfTodayUtc(): Date {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
}

function emptyTotals() {
  return { count: 0, impressions: 0, clicks: 0, budgetCents: 0 }
}

function addTotals(target: GroupTotal, source: GroupTotal): void {
  target.count += source.count
  target.impressions += source.impressions
  target.clicks += source.clicks
  target.budgetCents += source.budgetCents
}

function toAdvertiserRow(row: AdvertiserLeanRow) {
  return {
    id: String(row._id),
    businessName: row.businessName,
    email: row.email,
    billingEmail: row.billingEmail ?? '',
    status: row.status,
    isEmailVerified: row.isEmailVerified,
    lastLoginAt: row.lastLoginAt ?? null,
    createdAt: row.createdAt,
  }
}

function toCampaignRow(row: CampaignLeanRow) {
  return {
    id: String(row._id),
    name: row.name,
    placement: row.placement,
    placementLabel: PLACEMENT_LABELS[row.placement],
    status: row.status,
    headline: row.creative?.headline ?? '',
    imageUrl: row.creative?.imageUrl ?? null,
    budgetCents: row.budgetCents,
    durationDays: row.durationDays,
    impressions: row.impressions,
    clicks: row.clicks,
    ctr: ctr(row.clicks, row.impressions),
    startDate: row.startDate ?? null,
    endDate: row.endDate ?? null,
    submittedAt: row.submittedAt ?? null,
    reviewedAt: row.reviewedAt ?? null,
    reviewNote: row.reviewNote ?? null,
    advertiser: row.advertiser
      ? { id: String(row.advertiser._id), businessName: row.advertiser.businessName, email: row.advertiser.email }
      : null,
  }
}

function withCtr<T extends { clicks: number; impressions: number }>(row: T) {
  return { ...row, ctr: ctr(row.clicks, row.impressions) }
}

async function sweepEnded(): Promise<void> {
  await adminAdvertisementRepository.completeEnded(startOfTodayUtc())
}

export const advertisementService = {
  // Totals are summed from the stored campaign records. Revenue is the budget committed to campaigns, because no
  // payment provider is connected yet.
  async overview() {
    await sweepEnded()
    const [campaignGroups, advertiserGroups] = await Promise.all([
      adminAdvertisementRepository.groupCampaignsByStatus(),
      adminAdvertisementRepository.countAdvertisersByStatus(),
    ])

    const totals = emptyTotals()
    const campaignsByStatus: Partial<Record<CampaignStatus, number>> = {}
    for (const group of campaignGroups) {
      addTotals(totals, group)
      campaignsByStatus[group._id] = group.count
    }

    const advertisersByStatus: Partial<Record<AdvertiserStatus, number>> = {}
    for (const group of advertiserGroups) {
      advertisersByStatus[group._id] = group.count
    }

    const committedCents = campaignGroups
      .filter((group) => COMMITTED_CAMPAIGN_STATUSES.includes(group._id))
      .reduce((sum, group) => sum + group.budgetCents, 0)

    return {
      totals: {
        ...withCtr(totals),
        committedCents,
        activeCampaigns: campaignsByStatus[CAMPAIGN_STATUSES.ACTIVE] ?? 0,
        pendingApprovals: campaignsByStatus[CAMPAIGN_STATUSES.PENDING_REVIEW] ?? 0,
      },
      campaignsByStatus,
      advertisersByStatus,
      paymentsEnabled: false,
    }
  },

  async listAdvertisers(status?: AdvertiserStatus) {
    const rows = await adminAdvertisementRepository.findAdvertisers(status)
    return rows.map(toAdvertiserRow)
  },

  // Suspending blocks sign-in. Public ads do not check the advertiser's status, so the live campaigns are paused too.
  // Restoring the account does not resume them; the advertiser or an admin does that deliberately.
  async setAdvertiserStatus(id: string, status: AdvertiserStatus) {
    const advertiser = await adminAdvertisementRepository.findAdvertiserById(id)
    if (!advertiser) throw new AppError('Advertiser not found.', 404)

    const previousStatus = advertiser.status
    if (previousStatus === status) {
      return { advertiser: toAdvertiserRow(advertiser), previousStatus, pausedCampaigns: 0 }
    }

    if (status === ADVERTISER_STATUSES.ACTIVE && !advertiser.isEmailVerified) {
      throw new AppError('This advertiser has not verified their email yet, so the account cannot be activated.', 409)
    }

    const updated = await adminAdvertisementRepository.setAdvertiserStatus(id, status)
    if (!updated) throw new AppError('Advertiser not found.', 404)

    let pausedCampaigns = 0
    if (status === ADVERTISER_STATUSES.SUSPENDED) {
      pausedCampaigns = await adminAdvertisementRepository.pauseActiveCampaigns(id)
    }

    return { advertiser: toAdvertiserRow(updated), previousStatus, pausedCampaigns }
  },

  async listCampaigns(filter: { status?: CampaignStatus; placement?: CampaignPlacement }) {
    await sweepEnded()
    const query: { status?: CampaignStatus; placement?: CampaignPlacement } = {}
    if (filter.status) query.status = filter.status
    if (filter.placement) query.placement = filter.placement
    const rows = await adminAdvertisementRepository.listCampaigns(query, { updatedAt: -1 })
    return rows.map(toCampaignRow)
  },

  // Approval queue: campaigns waiting for review, oldest submission first.
  async approvals() {
    await sweepEnded()
    const rows = await adminAdvertisementRepository.listCampaigns(
      { status: CAMPAIGN_STATUSES.PENDING_REVIEW },
      { submittedAt: 1 },
    )
    return rows.map(toCampaignRow)
  },

  async approveCampaign(id: string) {
    const campaign = await adminAdvertisementRepository.findCampaignById(id)
    if (!campaign) throw new AppError('Campaign not found.', 404)
    if (campaign.status !== CAMPAIGN_STATUSES.PENDING_REVIEW) {
      throw new AppError('Only campaigns waiting for review can be approved.', 409)
    }
    if (!campaign.endDate || campaign.endDate < startOfTodayUtc()) {
      throw new AppError('This campaign needs an end date that has not passed before it can be approved.', 409)
    }

    const advertiser = await adminAdvertisementRepository.findAdvertiserById(String(campaign.advertiser))
    if (!advertiser || advertiser.status !== ADVERTISER_STATUSES.ACTIVE) {
      throw new AppError('The advertiser account must be active before its campaigns can be approved.', 409)
    }

    const now = new Date()
    const approved = await adminAdvertisementRepository.transitionCampaign(id, [CAMPAIGN_STATUSES.PENDING_REVIEW], {
      $set: { status: CAMPAIGN_STATUSES.ACTIVE, reviewedAt: now },
      $unset: { reviewNote: 1 },
    })
    if (!approved) throw new AppError('This campaign was already reviewed. Refresh the approval queue.', 409)
    return { id: String(approved._id), name: approved.name, status: approved.status }
  },

  async rejectCampaign(id: string, reviewNote: string) {
    const rejected = await adminAdvertisementRepository.transitionCampaign(
      id,
      [CAMPAIGN_STATUSES.PENDING_REVIEW, CAMPAIGN_STATUSES.ACTIVE, CAMPAIGN_STATUSES.PAUSED],
      { $set: { status: CAMPAIGN_STATUSES.REJECTED, reviewedAt: new Date(), reviewNote } },
    )
    if (!rejected) {
      const exists = await adminAdvertisementRepository.findCampaignById(id)
      if (!exists) throw new AppError('Campaign not found.', 404)
      throw new AppError('This campaign cannot be rejected in its current status.', 409)
    }
    return { id: String(rejected._id), name: rejected.name, status: rejected.status }
  },

  // Placement summary: what is live, what is waiting, and how each placement performs.
  async placements() {
    await sweepEnded()
    const groups = await adminAdvertisementRepository.groupCampaignsByPlacement()

    return ALL_CAMPAIGN_PLACEMENTS.map((placement) => {
      const live = emptyTotals()
      const pending = emptyTotals()
      const all = emptyTotals()
      for (const group of groups) {
        if (group._id.placement !== placement) continue
        addTotals(all, group)
        if (group._id.status === CAMPAIGN_STATUSES.ACTIVE) addTotals(live, group)
        if (group._id.status === CAMPAIGN_STATUSES.PENDING_REVIEW) addTotals(pending, group)
      }
      return {
        placement,
        label: PLACEMENT_LABELS[placement],
        requirements: PLACEMENT_REQUIREMENTS[placement],
        liveCampaigns: live.count,
        pendingCampaigns: pending.count,
        ...withCtr(all),
      }
    })
  },

  async scheduling() {
    await sweepEnded()
    const rows = await adminAdvertisementRepository.listCampaigns(
      { status: { $in: SCHEDULED_STATUSES } },
      { startDate: 1 },
    )
    return rows.map(toCampaignRow)
  },

  async analytics() {
    await sweepEnded()
    const [statusGroups, placementGroups] = await Promise.all([
      adminAdvertisementRepository.groupCampaignsByStatus(),
      adminAdvertisementRepository.groupCampaignsByPlacement(),
    ])

    const totals = emptyTotals()
    const byStatus: Partial<Record<CampaignStatus, number>> = {}
    for (const group of statusGroups) {
      addTotals(totals, group)
      byStatus[group._id] = group.count
    }

    const byPlacement = ALL_CAMPAIGN_PLACEMENTS.map((placement) => {
      const row = emptyTotals()
      for (const group of placementGroups) {
        if (group._id.placement === placement) addTotals(row, group)
      }
      return { placement, label: PLACEMENT_LABELS[placement], ...withCtr(row) }
    })

    const committedCents = statusGroups
      .filter((group) => COMMITTED_CAMPAIGN_STATUSES.includes(group._id))
      .reduce((sum, group) => sum + group.budgetCents, 0)

    return { totals: { ...withCtr(totals), committedCents }, byStatus, byPlacement }
  },

  // Read-only. Prices, rules, and bundles are code constants, so this page cannot change them yet.
  settings() {
    return {
      placementPrices: pricingCatalog.placements,
      campaignDurations: CAMPAIGN_DURATIONS,
      newsletter: {
        sendCents: NEWSLETTER_SEND_CENTS,
        windowDays: NEWSLETTER_WINDOW_DAYS,
        maxSends: MAX_NEWSLETTER_SENDS,
      },
      bundles: BUNDLES,
      placementLabels: PLACEMENT_LABELS,
      placementRequirements: PLACEMENT_REQUIREMENTS,
      autoApproveCampaigns: env.ADVERTISER_CAMPAIGN_AUTO_APPROVE,
    }
  },
}
