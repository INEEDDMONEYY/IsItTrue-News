import type { Request, Response } from 'express'
import { auditActor, auditLogService } from '../../auditLogs/services/auditLog.service.js'
import { asyncHandler } from '../../../utils/asyncHandler.js'
import { advertisementService } from '../services/advertisement.service.js'
import { ADVERTISER_STATUSES, CAMPAIGN_PLACEMENTS, CAMPAIGN_STATUSES, type AdvertiserStatus, type CampaignPlacement, type CampaignStatus } from '../../advertisers/constants/advertiser.js'
import type { AdvertiserStatusInput, RejectCampaignInput } from '../validations/advertisement.validation.js'

function queryValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function oneOf<T extends string>(value: string | undefined, allowed: readonly T[]): T | undefined {
  return value && (allowed as readonly string[]).includes(value) ? (value as T) : undefined
}

export const advertisementController = {
  overview: asyncHandler(async (_req: Request, res: Response) => {
    res.status(200).json(await advertisementService.overview())
  }),

  listAdvertisers: asyncHandler(async (req: Request, res: Response) => {
    const status = oneOf<AdvertiserStatus>(queryValue(req.query.status), Object.values(ADVERTISER_STATUSES))
    res.status(200).json({ advertisers: await advertisementService.listAdvertisers(status) })
  }),

  setAdvertiserStatus: asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.body as AdvertiserStatusInput
    const result = await advertisementService.setAdvertiserStatus(req.params.id, status)
    if (result.previousStatus !== status) {
      await auditLogService.record({
        eventType: 'advertisement.advertiser_status_changed',
        actor: auditActor(req.user),
        resource: { type: 'advertiser', id: result.advertiser.id, title: result.advertiser.businessName },
        metadata: { from: result.previousStatus, to: status, pausedCampaigns: result.pausedCampaigns },
      })
    }
    res.status(200).json({ message: 'Advertiser status updated.', ...result })
  }),

  listCampaigns: asyncHandler(async (req: Request, res: Response) => {
    const status = oneOf<CampaignStatus>(queryValue(req.query.status), Object.values(CAMPAIGN_STATUSES))
    const placement = oneOf<CampaignPlacement>(queryValue(req.query.placement), Object.values(CAMPAIGN_PLACEMENTS))
    res.status(200).json({ campaigns: await advertisementService.listCampaigns({ status, placement }) })
  }),

  approvals: asyncHandler(async (_req: Request, res: Response) => {
    res.status(200).json({ campaigns: await advertisementService.approvals() })
  }),

  approveCampaign: asyncHandler(async (req: Request, res: Response) => {
    const campaign = await advertisementService.approveCampaign(req.params.id)
    await auditLogService.record({
      eventType: 'advertisement.campaign_approved',
      actor: auditActor(req.user),
      resource: { type: 'campaign', id: campaign.id, title: campaign.name },
    })
    res.status(200).json({ message: 'Campaign approved.', campaign })
  }),

  rejectCampaign: asyncHandler(async (req: Request, res: Response) => {
    const { reviewNote } = req.body as RejectCampaignInput
    const campaign = await advertisementService.rejectCampaign(req.params.id, reviewNote)
    await auditLogService.record({
      eventType: 'advertisement.campaign_rejected',
      actor: auditActor(req.user),
      resource: { type: 'campaign', id: campaign.id, title: campaign.name },
      metadata: { reviewNote },
    })
    res.status(200).json({ message: 'Campaign rejected.', campaign })
  }),

  placements: asyncHandler(async (_req: Request, res: Response) => {
    res.status(200).json({ placements: await advertisementService.placements() })
  }),

  scheduling: asyncHandler(async (_req: Request, res: Response) => {
    res.status(200).json({ campaigns: await advertisementService.scheduling() })
  }),

  analytics: asyncHandler(async (_req: Request, res: Response) => {
    res.status(200).json(await advertisementService.analytics())
  }),

  settings: asyncHandler(async (_req: Request, res: Response) => {
    res.status(200).json(advertisementService.settings())
  }),
}
