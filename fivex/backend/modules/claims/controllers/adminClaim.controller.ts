import type { Request, Response } from 'express'
import { asyncHandler } from '../../../utils/asyncHandler.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { adminClaimService } from '../services/adminClaim.service.js'
import {
  adminClaimIdSchema,
  adminClaimListQuerySchema,
  type AssignInput,
  type ClearFlagInput,
  type CommentInput,
  type EscalateInput,
  type FlagEvidenceInput,
  type InvestigationLinkInput,
  type MetadataInput,
  type ResolveEscalationInput,
  type RestrictionInput,
  type ReturnInput,
  type RevisionInput,
  type UnassignInput,
} from '../validations/adminClaim.validation.js'

function admin(req: Request) {
  if (!req.user) throw new AppError('You must be signed in to access this resource.', 401)
  return { id: req.user.id, role: req.user.role }
}

function parseId(value: string) {
  const result = adminClaimIdSchema.safeParse(value)
  if (!result.success) throw new AppError(result.error.issues[0].message, 400)
  return result.data
}

// Moderation data changes the moment an admin acts: never let a browser or proxy reuse it.
function noStore(res: Response) {
  res.setHeader('Cache-Control', 'no-store')
}

function done(res: Response, message: string, record: unknown): void {
  res.status(200).json({ message, record })
}

export const adminClaimController = {
  overview: asyncHandler(async (_req: Request, res: Response) => {
    noStore(res)
    res.status(200).json(await adminClaimService.overview())
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const parsed = adminClaimListQuerySchema.safeParse(req.query)
    if (!parsed.success) {
      throw new AppError(parsed.error.issues.map((issue) => `${issue.path.join('.') || 'query'}: ${issue.message}`).join('; '), 400)
    }
    noStore(res)
    res.status(200).json(await adminClaimService.list(parsed.data))
  }),

  reviewers: asyncHandler(async (_req: Request, res: Response) => {
    noStore(res)
    res.status(200).json({ reviewers: await adminClaimService.reviewers() })
  }),

  investigations: asyncHandler(async (req: Request, res: Response) => {
    const q = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 100) : undefined
    noStore(res)
    res.status(200).json({ investigations: await adminClaimService.investigations(q || undefined) })
  }),

  get: asyncHandler(async (req: Request, res: Response) => {
    noStore(res)
    res.status(200).json({ record: await adminClaimService.getDetail(parseId(req.params.id)) })
  }),

  history: asyncHandler(async (req: Request, res: Response) => {
    noStore(res)
    res.status(200).json(await adminClaimService.getHistory(parseId(req.params.id)))
  }),

  assign: asyncHandler(async (req: Request, res: Response) =>
    done(res, 'Reviewer assigned.', await adminClaimService.assign(parseId(req.params.id), admin(req), req.body as AssignInput)),
  ),
  unassign: asyncHandler(async (req: Request, res: Response) =>
    done(res, 'Reviewer removed.', await adminClaimService.unassign(parseId(req.params.id), admin(req), req.body as UnassignInput)),
  ),
  returnForReview: asyncHandler(async (req: Request, res: Response) =>
    done(res, 'Returned for further review.', await adminClaimService.returnForReview(parseId(req.params.id), admin(req), req.body as ReturnInput)),
  ),
  escalate: asyncHandler(async (req: Request, res: Response) =>
    done(res, 'Escalated.', await adminClaimService.escalate(parseId(req.params.id), admin(req), req.body as EscalateInput)),
  ),
  resolveEscalation: asyncHandler(async (req: Request, res: Response) =>
    done(res, 'Escalation resolved.', await adminClaimService.resolveEscalation(parseId(req.params.id), admin(req), req.body as ResolveEscalationInput)),
  ),
  flagEvidence: asyncHandler(async (req: Request, res: Response) =>
    done(res, 'Evidence flagged.', await adminClaimService.flagEvidence(parseId(req.params.id), admin(req), req.body as FlagEvidenceInput)),
  ),
  clearEvidenceFlag: asyncHandler(async (req: Request, res: Response) =>
    done(res, 'Evidence flag cleared.', await adminClaimService.clearEvidenceFlag(parseId(req.params.id), admin(req), req.body as ClearFlagInput)),
  ),
  setEvidenceRestriction: asyncHandler(async (req: Request, res: Response) =>
    done(
      res,
      'Evidence access updated.',
      await adminClaimService.setEvidenceRestriction(parseId(req.params.id), parseId(req.params.itemId), admin(req), req.body as RestrictionInput),
    ),
  ),
  reviseAssessment: asyncHandler(async (req: Request, res: Response) =>
    done(res, 'Conclusion revised.', await adminClaimService.reviseAssessment(parseId(req.params.id), admin(req), req.body as RevisionInput)),
  ),
  correctMetadata: asyncHandler(async (req: Request, res: Response) =>
    done(res, 'Record updated.', await adminClaimService.correctMetadata(parseId(req.params.id), admin(req), req.body as MetadataInput)),
  ),
  comment: asyncHandler(async (req: Request, res: Response) =>
    done(res, 'Comment added.', await adminClaimService.comment(parseId(req.params.id), admin(req), req.body as CommentInput)),
  ),
  linkInvestigation: asyncHandler(async (req: Request, res: Response) =>
    done(res, 'Investigation link updated.', await adminClaimService.linkInvestigation(parseId(req.params.id), admin(req), req.body as InvestigationLinkInput)),
  ),
}
