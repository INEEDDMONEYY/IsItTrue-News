import type { Request, Response } from 'express'
import { AppError } from '../../../shared/errors/AppError.js'
import { setAdvertiserSessionCookie } from '../../../security/advertiserSession.js'
import { asyncHandler } from '../../../utils/asyncHandler.js'
import { advertiserAccountService } from '../services/advertiserAccount.service.js'
import { advertiserCampaignService } from '../services/advertiserCampaign.service.js'
import { advertiserLibraryService } from '../services/advertiserLibrary.service.js'
import { advertiserReportService } from '../services/advertiserReport.service.js'
import { pricingCatalog } from '../services/advertiserPricing.js'
import type {
  BundleInput,
  CampaignEditInput,
  CampaignInput,
  ChangePasswordInput,
  UpdateNotificationsInput,
  UpdateProfileInput,
} from '../validations/advertiser.validation.js'

function advertiserId(req: Request): string {
  if (!req.advertiser) throw new AppError('You must be signed in to access this resource.', 401)
  return req.advertiser.id
}

function param(req: Request, name: string): string {
  return String(req.params[name] ?? '')
}

// Everything an advertiser does inside the portal once signed in. Every handler is scoped to req.advertiser.
export const advertiserWorkspaceController = {
  listCampaigns: asyncHandler(async (req: Request, res: Response) => {
    const status = advertiserCampaignService.isStatus(req.query.status) ? req.query.status : undefined
    const search = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 120) : ''
    const campaigns = await advertiserCampaignService.list(advertiserId(req), { status, search: search || undefined })
    res.status(200).json({ campaigns })
  }),

  getCampaign: asyncHandler(async (req: Request, res: Response) => {
    const campaign = await advertiserCampaignService.get(advertiserId(req), param(req, 'id'))
    res.status(200).json({ campaign })
  }),

  createCampaign: asyncHandler(async (req: Request, res: Response) => {
    const campaign = await advertiserCampaignService.create(advertiserId(req), req.body as CampaignInput)
    res.status(201).json({ campaign })
  }),

  createBundle: asyncHandler(async (req: Request, res: Response) => {
    const campaigns = await advertiserCampaignService.createBundle(advertiserId(req), req.body as BundleInput)
    res.status(201).json({ campaigns })
  }),

  pricing: asyncHandler(async (_req: Request, res: Response) => {
    res.status(200).json(pricingCatalog)
  }),

  updateCampaign: asyncHandler(async (req: Request, res: Response) => {
    const campaign = await advertiserCampaignService.update(advertiserId(req), param(req, 'id'), req.body as CampaignEditInput)
    res.status(200).json({ campaign })
  }),

  pauseCampaign: asyncHandler(async (req: Request, res: Response) => {
    const campaign = await advertiserCampaignService.pause(advertiserId(req), param(req, 'id'))
    res.status(200).json({ campaign })
  }),

  resumeCampaign: asyncHandler(async (req: Request, res: Response) => {
    const campaign = await advertiserCampaignService.resume(advertiserId(req), param(req, 'id'))
    res.status(200).json({ campaign })
  }),

  deleteCampaign: asyncHandler(async (req: Request, res: Response) => {
    await advertiserCampaignService.remove(advertiserId(req), param(req, 'id'))
    res.status(200).json({ message: 'Campaign deleted.' })
  }),

  listAssets: asyncHandler(async (req: Request, res: Response) => {
    const assets = await advertiserLibraryService.list(advertiserId(req))
    res.status(200).json({ assets })
  }),

  uploadAsset: asyncHandler(async (req: Request, res: Response) => {
    const name = typeof req.body?.name === 'string' ? (req.body.name as string) : undefined
    const asset = await advertiserLibraryService.upload(advertiserId(req), req.file, name)
    res.status(201).json({ asset: { ...asset.toJSON(), usedBy: 0 } })
  }),

  renameAsset: asyncHandler(async (req: Request, res: Response) => {
    const asset = await advertiserLibraryService.rename(advertiserId(req), param(req, 'id'), (req.body as { name: string }).name)
    res.status(200).json({ asset })
  }),

  deleteAsset: asyncHandler(async (req: Request, res: Response) => {
    await advertiserLibraryService.remove(advertiserId(req), param(req, 'id'))
    res.status(200).json({ message: 'Image deleted.' })
  }),

  analytics: asyncHandler(async (req: Request, res: Response) => {
    res.status(200).json(await advertiserReportService.analytics(advertiserId(req)))
  }),

  billing: asyncHandler(async (req: Request, res: Response) => {
    res.status(200).json(await advertiserReportService.billing(advertiserId(req)))
  }),

  updateProfile: asyncHandler(async (req: Request, res: Response) => {
    const advertiser = await advertiserAccountService.updateProfile(advertiserId(req), req.body as UpdateProfileInput)
    res.status(200).json({ advertiser })
  }),

  uploadLogo: asyncHandler(async (req: Request, res: Response) => {
    const advertiser = await advertiserAccountService.uploadLogo(advertiserId(req), req.file)
    res.status(200).json({ advertiser })
  }),

  removeLogo: asyncHandler(async (req: Request, res: Response) => {
    const advertiser = await advertiserAccountService.removeLogo(advertiserId(req))
    res.status(200).json({ advertiser })
  }),

  updateNotifications: asyncHandler(async (req: Request, res: Response) => {
    const advertiser = await advertiserAccountService.updateNotifications(
      advertiserId(req),
      req.body as UpdateNotificationsInput,
    )
    res.status(200).json({ advertiser })
  }),

  changePassword: asyncHandler(async (req: Request, res: Response) => {
    const id = advertiserId(req)
    await advertiserAccountService.changePassword(id, req.body as ChangePasswordInput)
    // Other devices are signed out by the password change; this browser gets a fresh session so it stays in.
    setAdvertiserSessionCookie(res, id)
    res.status(200).json({ message: 'Password updated. Other devices have been signed out.' })
  }),
}
