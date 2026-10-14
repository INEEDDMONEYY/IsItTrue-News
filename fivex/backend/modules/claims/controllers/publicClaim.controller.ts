import type { Request, Response } from 'express'
import { asyncHandler } from '../../../utils/asyncHandler.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { publicClaimService } from '../services/publicClaim.service.js'
import {
  publicClaimIdSchema,
  publicFactCheckListQuerySchema,
  publicSlugSchema,
} from '../validations/publicClaim.validation.js'

function parse<T>(schema: { safeParse: (value: unknown) => { success: true; data: T } | { success: false; error: { issues: { path: PropertyKey[]; message: string }[] } } }, value: unknown): T {
  const result = schema.safeParse(value)
  if (!result.success) {
    throw new AppError(result.error.issues.map((issue) => `${issue.path.join('.') || 'request'}: ${issue.message}`).join('; '), 400)
  }
  return result.data
}

// Public, so anyone can read it, but a withdrawn conclusion has to disappear promptly: browsers may keep a copy
// but must check with the server before showing it again.
function revalidate(res: Response) {
  res.setHeader('Cache-Control', 'no-cache')
}

export const publicClaimController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const query = parse(publicFactCheckListQuerySchema, req.query)
    revalidate(res)
    res.status(200).json(await publicClaimService.list(query))
  }),

  forArticle: asyncHandler(async (req: Request, res: Response) => {
    const slug = parse(publicSlugSchema, req.params.slug)
    revalidate(res)
    res.status(200).json(await publicClaimService.forArticle(slug))
  }),

  get: asyncHandler(async (req: Request, res: Response) => {
    const id = parse(publicClaimIdSchema, req.params.id)
    revalidate(res)
    res.status(200).json({ factCheck: await publicClaimService.getDetail(id) })
  }),
}
