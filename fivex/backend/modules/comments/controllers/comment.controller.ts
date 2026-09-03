import type { Request, Response } from 'express'
import { asyncHandler } from '../../../utils/asyncHandler.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { commentService } from '../services/comment.service.js'
import type { CreateCommentInput } from '../validations/comment.validation.js'

function requireUser(req: Request) {
  if (!req.user) {
    throw new AppError('You must be signed in to access this resource.', 401)
  }
  return req.user
}

export const commentController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req)
    const { articleId, content } = req.body as CreateCommentInput
    const comment = await commentService.createComment(articleId, user.id, content)
    res.status(201).json({ message: 'Comment posted successfully.', comment })
  }),

  listByArticle: asyncHandler(async (req: Request, res: Response) => {
    const comments = await commentService.listByArticle(req.params.articleId)
    const likedCommentIds = req.user
      ? comments
          .filter((comment) => comment.likedBy.some((id) => id.toString() === req.user!.id))
          .map((comment) => comment.id as string)
      : []
    res.status(200).json({ comments, likedCommentIds })
  }),

  listMine: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req)
    const comments = await commentService.listMyComments(user.id)
    res.status(200).json({ comments })
  }),

  listOnMyArticles: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req)
    const comments = await commentService.listCommentsOnMyArticles(user.id)
    res.status(200).json({ comments })
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req)
    await commentService.deleteComment(req.params.id, user)
    res.status(200).json({ message: 'Comment deleted successfully.' })
  }),

  toggleLike: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req)
    const result = await commentService.toggleLike(req.params.id, user.id)
    res.status(200).json(result)
  }),
}
