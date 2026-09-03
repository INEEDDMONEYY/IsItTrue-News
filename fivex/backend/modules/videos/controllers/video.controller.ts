import type { Request, Response } from 'express'
import { asyncHandler } from '../../../utils/asyncHandler.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { videoService } from '../services/video.service.js'
import type {
  CreateVideoInput,
  UpdateVideoInput,
  UpdateVideoStatusInput,
} from '../validations/video.validation.js'

function requireUser(req: Request) {
  if (!req.user) {
    throw new AppError('You must be signed in to access this resource.', 401)
  }
  return req.user
}

// Free-plan/anonymous viewers over the free duration cap get everything
// except the actual playable video URL (see resolveVideoLock).
function serializeVideo(video: Awaited<ReturnType<typeof videoService.getVideoById>>['video'], locked: boolean) {
  const json = video.toJSON() as Record<string, unknown>
  if (locked) {
    delete json.videoUrl
  }
  return { ...json, locked }
}

export const videoController = {
  listPublished: asyncHandler(async (req: Request, res: Response) => {
    const category = typeof req.query.category === 'string' ? req.query.category : undefined
    const videos = await videoService.listPublished(category)
    res.status(200).json({ videos })
  }),

  // Public: a given author's published videos, for their public profile page.
  listByAuthor: asyncHandler(async (req: Request, res: Response) => {
    const videos = await videoService.listPublishedByAuthor(req.params.id)
    res.status(200).json({ videos })
  }),

  // Public: a given reader's liked videos, for their public profile page.
  listLiked: asyncHandler(async (req: Request, res: Response) => {
    const videos = await videoService.listLikedByUser(req.params.id)
    res.status(200).json({ videos })
  }),

  listMine: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req)
    const videos = await videoService.listOwnVideos(user.id)
    res.status(200).json({ videos })
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const { video, locked } = await videoService.getVideoById(req.params.id, req.user)
    const liked = req.user ? video.likedBy.some((id) => id.toString() === req.user!.id) : false
    const bookmarked = req.user
      ? video.bookmarkedBy.some((entry) => entry.user.toString() === req.user!.id)
      : false
    res.status(200).json({ video: serializeVideo(video, locked), liked, bookmarked })
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req)
    const input = req.body as CreateVideoInput
    const video = await videoService.createVideo(user.id, input)
    res.status(201).json({ message: 'Video created successfully.', video })
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req)
    const input = req.body as UpdateVideoInput
    await videoService.updateVideo(req.params.id, user, input)
    res.status(200).json({ message: 'Video updated successfully.' })
  }),

  updateStatus: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req)
    const { status } = req.body as UpdateVideoStatusInput
    await videoService.updateStatus(req.params.id, status, user)
    res.status(200).json({ message: 'Video status updated successfully.' })
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req)
    await videoService.deleteVideo(req.params.id, user)
    res.status(200).json({ message: 'Video deleted successfully.' })
  }),

  recordView: asyncHandler(async (req: Request, res: Response) => {
    await videoService.recordView(req.params.id, req.user?.id)
    res.status(204).send()
  }),

  toggleLike: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req)
    const result = await videoService.toggleLike(req.params.id, user.id)
    res.status(200).json(result)
  }),

  toggleBookmark: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req)
    const result = await videoService.toggleBookmark(req.params.id, user.id)
    res.status(200).json(result)
  }),
}
