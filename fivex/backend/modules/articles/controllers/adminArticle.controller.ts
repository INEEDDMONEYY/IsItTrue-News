import type { Request, Response } from 'express'
import { asyncHandler } from '../../../utils/asyncHandler.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { adminArticleService } from '../services/adminArticle.service.js'
import {
  adminArticleIdSchema,
  adminArticleListQuerySchema,
  type AdminArticleStatusInput,
} from '../validations/adminArticle.validation.js'

function requireAdmin(req: Request) {
  if (!req.user) throw new AppError('You must be signed in to access this resource.', 401)
  return req.user
}

function parseId(value: string) {
  const result = adminArticleIdSchema.safeParse(value)
  if (!result.success) throw new AppError(result.error.issues[0].message, 400)
  return result.data
}

// This is moderation data and changes the moment an admin acts: never let a browser or proxy reuse it.
function noStore(res: Response) {
  res.setHeader('Cache-Control', 'no-store')
}

export const adminArticleController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const parsed = adminArticleListQuerySchema.safeParse(req.query)
    if (!parsed.success) {
      throw new AppError(parsed.error.issues.map((issue) => `${issue.path.join('.') || 'query'}: ${issue.message}`).join('; '), 400)
    }
    noStore(res)
    res.status(200).json(await adminArticleService.list(parsed.data))
  }),

  get: asyncHandler(async (req: Request, res: Response) => {
    noStore(res)
    res.status(200).json({ article: await adminArticleService.getDetail(parseId(req.params.id)) })
  }),

  audit: asyncHandler(async (req: Request, res: Response) => {
    noStore(res)
    res.status(200).json(await adminArticleService.getAuditTrail(parseId(req.params.id)))
  }),

  changeStatus: asyncHandler(async (req: Request, res: Response) => {
    const admin = requireAdmin(req)
    const article = await adminArticleService.changeStatus(parseId(req.params.id), admin, req.body as AdminArticleStatusInput)
    res.status(200).json({ message: 'Article status updated.', article })
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const admin = requireAdmin(req)
    await adminArticleService.remove(parseId(req.params.id), admin)
    res.status(200).json({ message: 'Article deleted.' })
  }),
}
