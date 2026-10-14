import type { Request, Response } from 'express'
import { asyncHandler } from '../../../utils/asyncHandler.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { claimService } from '../services/claim.service.js'
import type {
  AddEvidenceInput,
  CreateClaimInput,
  SetArticleFactCheckInput,
  UpdateClaimInput,
} from '../validations/claim.validation.js'

function actor(req: Request) {
  if (!req.user) throw new AppError('You must be signed in to access this resource.', 401)
  return { id: req.user.id, role: req.user.role }
}

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
    const claim = await claimService.createClaim(actor(req), req.body as CreateClaimInput)
    res.status(201).json({ message: 'Claim added.', claim })
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const claim = await claimService.updateClaim(req.params.id, actor(req), req.body as UpdateClaimInput)
    res.status(200).json({ message: 'Claim updated.', claim })
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await claimService.deleteClaim(req.params.id, actor(req))
    res.status(200).json({ message: 'Claim deleted.' })
  }),

  takeResponsibility: asyncHandler(async (req: Request, res: Response) => {
    const claim = await claimService.takeResponsibility(req.params.id, actor(req))
    res.status(200).json({ message: 'You are now responsible for this claim.', claim })
  }),

  addEvidence: asyncHandler(async (req: Request, res: Response) => {
    const claim = await claimService.addEvidence(req.params.id, actor(req), req.body as AddEvidenceInput)
    res.status(201).json({ message: 'Evidence added.', claim })
  }),

  removeEvidence: asyncHandler(async (req: Request, res: Response) => {
    const claim = await claimService.removeEvidence(req.params.id, req.params.itemId, actor(req))
    res.status(200).json({ message: 'Evidence removed.', claim })
  }),

  setArticleFactChecked: asyncHandler(async (req: Request, res: Response) => {
    const { factChecked } = req.body as SetArticleFactCheckInput
    await claimService.setArticleFactChecked(req.params.articleId, actor(req).id, factChecked)
    res.status(200).json({
      message: factChecked ? 'Article marked as fact-checked.' : 'Fact-checked mark removed.',
    })
  }),
}
