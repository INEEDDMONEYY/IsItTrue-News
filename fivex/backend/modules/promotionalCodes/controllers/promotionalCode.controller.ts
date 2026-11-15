import type { Request, Response } from 'express'
import { auditActor, auditLogService } from '../../auditLogs/services/auditLog.service.js'
import { asyncHandler } from '../../../utils/asyncHandler.js'
import { promotionalCodeService } from '../services/promotionalCode.service.js'
import type { PromotionalCodeInput } from '../validations/promotionalCode.validation.js'

function resourceFor(code: { id?: string; _id?: unknown; code: string }) {
  return { type: 'promotional_code', id: String(code._id ?? code.id), title: code.code }
}

export const promotionalCodeController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    const codes = await promotionalCodeService.list()
    res.status(200).json({ codes })
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const code = await promotionalCodeService.create(req.body as PromotionalCodeInput)
    await auditLogService.record({
      eventType: 'advertisement.promo_code_created',
      actor: auditActor(req.user),
      resource: resourceFor(code),
      metadata: { method: code.method, status: code.status },
    })
    res.status(201).json({ message: 'Promotional code created successfully.', code })
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const code = await promotionalCodeService.update(req.params.id, req.body as PromotionalCodeInput)
    await auditLogService.record({
      eventType: 'advertisement.promo_code_updated',
      actor: auditActor(req.user),
      resource: resourceFor(code),
      metadata: { status: code.status },
    })
    res.status(200).json({ message: 'Promotional code updated successfully.', code })
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const code = await promotionalCodeService.remove(req.params.id)
    await auditLogService.record({
      eventType: 'advertisement.promo_code_deleted',
      actor: auditActor(req.user),
      resource: resourceFor(code),
    })
    res.status(200).json({ message: 'Promotional code deleted successfully.' })
  }),
}
