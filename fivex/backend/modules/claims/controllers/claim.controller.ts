import type { Request, Response } from 'express'
import { asyncHandler } from '../../../utils/asyncHandler.js'
import { claimService } from '../services/claim.service.js'
import type { CreateClaimInput, SetArticleFactCheckInput, UpdateClaimInput } from '../validations/claim.validation.js'

export const claimController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    const claims = await claimService.listClaims()
    res.status(200).json({ claims })
  }),

  listArticles: asyncHandler(async (_req: Request, res: Response) => {
    const articles = await claimService.listArticles()
    res.status(200).json({ articles })
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const claim = await claimService.createClaim(req.user!.id, req.body as CreateClaimInput)
    res.status(201).json({ message: 'Claim added.', claim })
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const claim = await claimService.updateClaim(req.params.id, req.user!.id, req.body as UpdateClaimInput)
    res.status(200).json({ message: 'Claim updated.', claim })
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await claimService.deleteClaim(req.params.id, req.user!.id)
    res.status(200).json({ message: 'Claim deleted.' })
  }),

  takeResponsibility: asyncHandler(async (req: Request, res: Response) => {
    const claim = await claimService.takeResponsibility(req.params.id, req.user!.id)
    res.status(200).json({ message: 'You are now responsible for this claim.', claim })
  }),

  setArticleFactChecked: asyncHandler(async (req: Request, res: Response) => {
    const { factChecked } = req.body as SetArticleFactCheckInput
    await claimService.setArticleFactChecked(req.params.articleId, req.user!.id, factChecked)
    res.status(200).json({
      message: factChecked ? 'Article marked as fact-checked.' : 'Fact-checked mark removed.',
    })
  }),
}
