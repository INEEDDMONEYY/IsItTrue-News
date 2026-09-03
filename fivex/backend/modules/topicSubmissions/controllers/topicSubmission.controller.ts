import type { Request, Response } from 'express'
import { asyncHandler } from '../../../utils/asyncHandler.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { topicSubmissionService } from '../services/topicSubmission.service.js'
import type { CreateTopicSubmissionInput } from '../validations/topicSubmission.validation.js'

export const topicSubmissionController = {
  // Any signed-in user (mainly readers) can suggest a topic for coverage.
  create: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError('You must be signed in to access this resource.', 401)
    }
    const input = req.body as CreateTopicSubmissionInput
    const submission = await topicSubmissionService.submitTopic(req.user.id, input)
    res.status(201).json({ message: 'Topic submitted successfully.', submission })
  }),

  // Any signed-in user: their own submitted topics.
  listMine: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError('You must be signed in to access this resource.', 401)
    }
    const submissions = await topicSubmissionService.listMine(req.user.id)
    res.status(200).json({ submissions })
  }),
}
