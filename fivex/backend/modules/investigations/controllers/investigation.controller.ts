import type { Request, Response } from 'express'
import { asyncHandler } from '../../../utils/asyncHandler.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { investigationService } from '../services/investigation.service.js'
import type {
  AddEditorCommentInput,
  AddInvestigationCommentInput,
  AddTimelineEntryInput,
  CreateInvestigationInput,
  RejectInvestigationInput,
  UpdateInvestigationInput,
  UpdateEditorialWorkflowInput,
} from '../validations/investigation.validation.js'

function requireUser(req: Request) {
  if (!req.user) {
    throw new AppError('You must be signed in to access this resource.', 401)
  }
  return req.user
}

export const investigationController = {
  // Public: reader-facing listing of published investigations.
  listPublished: asyncHandler(async (req: Request, res: Response) => {
    const category = typeof req.query.category === 'string' ? req.query.category : undefined
    const investigations = await investigationService.listPublished(category)
    res.status(200).json({ investigations })
  }),

  // Author/editor/admin: everything the signed-in user owns or collaborates on.
  listMine: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req)
    const investigations = await investigationService.listMine(user.id)
    res.status(200).json({ investigations })
  }),

  // Editor/admin: verification queue.
  listReviewQueue: asyncHandler(async (_req: Request, res: Response) => {
    const investigations = await investigationService.listReviewQueue()
    res.status(200).json({ investigations })
  }),

  listEditorialWorkflow: asyncHandler(async (_req: Request, res: Response) => {
    const investigations = await investigationService.listEditorialWorkflow()
    res.status(200).json({ investigations })
  }),

  // Author/collaborator/editor/admin always get the full workspace view;
  // everyone else only ever sees a sanitized, access-tier-gated published view.
  getById: asyncHandler(async (req: Request, res: Response) => {
    const result = await investigationService.getById(req.params.id, req.user)
    res.status(200).json(result)
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req)
    const input = req.body as CreateInvestigationInput
    const investigation = await investigationService.createInvestigation(user.id, input)
    res.status(201).json({ message: 'Investigation created successfully.', investigation })
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req)
    const input = req.body as UpdateInvestigationInput
    await investigationService.updateInvestigation(req.params.id, user, input)
    res.status(200).json({ message: 'Investigation updated successfully.' })
  }),

  updateEditorialWorkflow: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req)
    const input = req.body as UpdateEditorialWorkflowInput
    await investigationService.updateEditorialWorkflow(req.params.id, user, input)
    res.status(200).json({ message: 'Editorial workflow updated.' })
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req)
    await investigationService.deleteInvestigation(req.params.id, user)
    res.status(200).json({ message: 'Investigation deleted successfully.' })
  }),

  submit: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req)
    await investigationService.submitForReview(req.params.id, user)
    res.status(200).json({ message: 'Investigation submitted for review.' })
  }),

  publish: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req)
    await investigationService.publish(req.params.id, user)
    res.status(200).json({ message: 'Investigation published successfully.' })
  }),

  reject: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req)
    const { reason } = req.body as RejectInvestigationInput
    await investigationService.reject(req.params.id, user, reason)
    res.status(200).json({ message: 'Investigation rejected.' })
  }),

  addTimelineEntry: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req)
    const input = req.body as AddTimelineEntryInput
    await investigationService.addTimelineEntry(req.params.id, user, input)
    res.status(201).json({ message: 'Timeline entry added.' })
  }),

  removeTimelineEntry: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req)
    await investigationService.removeTimelineEntry(req.params.id, req.params.entryId, user)
    res.status(200).json({ message: 'Timeline entry removed.' })
  }),

  addEditorComment: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req)
    const { message } = req.body as AddEditorCommentInput
    await investigationService.addEditorComment(req.params.id, user, message)
    res.status(201).json({ message: 'Editorial comment added.' })
  }),

  addComment: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req)
    const { content } = req.body as AddInvestigationCommentInput
    await investigationService.addComment(req.params.id, user.id, content)
    res.status(201).json({ message: 'Comment posted successfully.' })
  }),

  toggleBookmark: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req)
    const result = await investigationService.toggleBookmark(req.params.id, user.id)
    res.status(200).json(result)
  }),

  toggleFollow: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req)
    const result = await investigationService.toggleFollow(req.params.id, user.id)
    res.status(200).json(result)
  }),
}
