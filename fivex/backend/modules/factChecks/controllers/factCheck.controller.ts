import type { Request, Response } from 'express'
import { asyncHandler } from '../../../utils/asyncHandler.js'
import { factCheckService } from '../services/factCheck.service.js'
import type { CreateFactCheckRequestInput, RejectFactCheckRequestInput } from '../validations/factCheck.validation.js'

export const factCheckController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const input = req.body as CreateFactCheckRequestInput
    const factCheck = await factCheckService.submitRequest(req.user!.id, input)
    res.status(201).json({
      message: 'Fact-check request sent to the IsItTrue Fact-Check Team.',
      factCheck,
    })
  }),

  listMine: asyncHandler(async (req: Request, res: Response) => {
    const factChecks = await factCheckService.listMine(req.user!.id)
    res.status(200).json({ factChecks })
  }),

  listPending: asyncHandler(async (_req: Request, res: Response) => {
    const factChecks = await factCheckService.listPending()
    res.status(200).json({ factChecks })
  }),

  listAll: asyncHandler(async (_req: Request, res: Response) => {
    const factChecks = await factCheckService.listAll()
    res.status(200).json({ factChecks })
  }),

  approve: asyncHandler(async (req: Request, res: Response) => {
    await factCheckService.approve(req.params.id, req.user!.id)
    res.status(200).json({ message: 'Fact-check request approved.' })
  }),

  reject: asyncHandler(async (req: Request, res: Response) => {
    const { reason } = req.body as RejectFactCheckRequestInput
    await factCheckService.reject(req.params.id, req.user!.id, reason)
    res.status(200).json({ message: 'Fact-check request rejected.' })
  }),
}
