import type { Request, Response } from 'express'
import { asyncHandler } from '../../../utils/asyncHandler.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { correctionService } from '../services/correction.service.js'
import { ALL_CORRECTION_STATUSES, type CorrectionStatus } from '../constants/correctionStatus.js'
import type {
  CreateCorrectionInput,
  DismissCorrectionInput,
  PublishCorrectionInput,
  RecordFindingsInput,
} from '../validations/correction.validation.js'

function requireUser(req: Request) {
  if (!req.user) {
    throw new AppError('You must be signed in to access this resource.', 401)
  }
  return req.user
}

export const correctionController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req)
    const correction = await correctionService.create(user, req.body as CreateCorrectionInput)
    res.status(201).json({ message: 'Correction request submitted.', correction })
  }),

  // Editor/admin: every correction (optionally one stage) plus per-stage counts.
  list: asyncHandler(async (req: Request, res: Response) => {
    const requested = typeof req.query.status === 'string' ? req.query.status : undefined
    if (requested && !ALL_CORRECTION_STATUSES.includes(requested as CorrectionStatus)) {
      throw new AppError('Unknown correction status.', 400)
    }
    const result = await correctionService.list(requested as CorrectionStatus | undefined)
    res.status(200).json(result)
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const correction = await correctionService.getById(req.params.id)
    res.status(200).json({ correction })
  }),

  startInvestigation: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req)
    const correction = await correctionService.startInvestigation(req.params.id, user)
    res.status(200).json({ correction })
  }),

  recordFindings: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req)
    const correction = await correctionService.recordFindings(req.params.id, user, req.body as RecordFindingsInput)
    res.status(200).json({ correction })
  }),

  publish: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req)
    const correction = await correctionService.publish(req.params.id, user, req.body as PublishCorrectionInput)
    res.status(200).json({ correction })
  }),

  dismiss: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req)
    const correction = await correctionService.dismiss(req.params.id, user, req.body as DismissCorrectionInput)
    res.status(200).json({ correction })
  }),
}
