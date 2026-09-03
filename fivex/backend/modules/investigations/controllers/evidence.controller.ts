import type { Request, Response } from 'express'
import { asyncHandler } from '../../../utils/asyncHandler.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { evidenceService } from '../services/evidence.service.js'
import type { CreateEvidenceInput, UpdateEvidenceInput } from '../validations/evidence.validation.js'

function requireUser(req: Request) {
  if (!req.user) {
    throw new AppError('You must be signed in to access this resource.', 401)
  }
  return req.user
}

export const evidenceController = {
  // Author/collaborator/editor/admin only — the private vault for one investigation.
  listVault: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req)
    const evidence = await evidenceService.listVault(req.params.investigationId, user)
    res.status(200).json({ evidence })
  }),

  // Author/collaborator/editor/admin only — the global vault across every
  // investigation the user can manage.
  listMyVault: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req)
    const evidence = await evidenceService.listMyVault(user)
    res.status(200).json({ evidence })
  }),

  // Public: sanitized, approved, watermarked evidence for the reader-facing
  // Evidence Viewer embedded in a published investigation.
  listPublic: asyncHandler(async (req: Request, res: Response) => {
    const evidence = await evidenceService.listPublic(req.params.investigationId, req.user?.id)
    res.status(200).json({ evidence })
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req)
    const input = req.body as CreateEvidenceInput
    const evidence = await evidenceService.createEvidence(req.params.investigationId, user, input)
    res.status(201).json({ message: 'Evidence added to the vault.', evidence })
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req)
    const input = req.body as UpdateEvidenceInput
    await evidenceService.updateEvidence(req.params.evidenceId, user, input)
    res.status(200).json({ message: 'Evidence updated.' })
  }),

  approve: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req)
    await evidenceService.approveForPublic(req.params.evidenceId, user)
    res.status(200).json({ message: 'Evidence approved for public release.' })
  }),

  revoke: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req)
    await evidenceService.revokePublic(req.params.evidenceId, user)
    res.status(200).json({ message: 'Evidence removed from public view.' })
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req)
    await evidenceService.deleteEvidence(req.params.evidenceId, user)
    res.status(200).json({ message: 'Evidence deleted.' })
  }),
}
