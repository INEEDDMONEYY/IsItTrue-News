import type { Request, Response } from 'express'
import { AppError } from '../../../shared/errors/AppError.js'
import { asyncHandler } from '../../../utils/asyncHandler.js'
import { auditLogService } from '../services/auditLog.service.js'
import { auditLogListQuerySchema } from '../validations/auditLog.validation.js'

export const auditLogController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const parsed = auditLogListQuerySchema.safeParse(req.query)
    if (!parsed.success) {
      const message = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ')
      throw new AppError(message, 400)
    }
    res.setHeader('Cache-Control', 'no-store')
    res.status(200).json(await auditLogService.list(parsed.data))
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-store')
    res.status(200).json(await auditLogService.getById(String(req.params.id)))
  }),

  summary: asyncHandler(async (_req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-store')
    res.status(200).json(await auditLogService.summary())
  }),

  actors: asyncHandler(async (_req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-store')
    res.status(200).json(await auditLogService.actors())
  }),
}
