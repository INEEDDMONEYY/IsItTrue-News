import { AppError } from '../../../shared/errors/AppError.js'
import { ROLES, type Role } from '../../../shared/constants/roles.js'
import { FREE_PLAN_LIMITS } from '../../../shared/constants/plan.js'
import { videoRepository } from '../repositories/video.repository.js'
import { userRepository } from '../../users/repositories/user.repository.js'
import { VIDEO_STATUSES, type VideoStatus, type VideoVisibility } from '../constants/videoStatus.js'
import type { VideoDocument } from '../models/Video.js'

interface ActingUser {
  id: string
  role: Role
}

function assertCanManage(video: VideoDocument, actingUser: ActingUser) {
  const isOwner = video.author.toString() === actingUser.id
  const isPrivileged = actingUser.role === ROLES.ADMIN || actingUser.role === ROLES.EDITOR
  if (!isOwner && !isPrivileged) {
    throw new AppError('You do not have permission to modify this video.', 403)
  }
}

// Short clips/key moments/trailer-style previews (<= maxFreeVideoDurationSeconds)
// are unlimited for everyone. Longer full videos require a premium plan —
// gated for anonymous viewers and free-plan readers alike, but never for the
// video's own author/editors/admins.
async function resolveVideoLock(video: VideoDocument, actingUser?: ActingUser): Promise<boolean> {
  if (video.duration <= FREE_PLAN_LIMITS.maxFreeVideoDurationSeconds) return false

  const isOwner = actingUser?.id === video.author.toString()
  const isPrivileged = actingUser?.role === ROLES.ADMIN || actingUser?.role === ROLES.EDITOR
  if (isOwner || isPrivileged) return false

  if (!actingUser) return true

  const viewer = await userRepository.findById(actingUser.id)
  return viewer?.plan !== 'premium'
}

export const videoService = {
  // Authors (and editors) publish their own videos directly — there is no
  // editorial review gate blocking that, the same as articles.
  async createVideo(
    authorId: string,
    input: {
      title: string
      description?: string
      category: string
      tags?: string[]
      status: VideoStatus
      visibility?: VideoVisibility
      videoUrl: string
      thumbnailUrl?: string
      duration?: number
    },
  ) {
    const publishedAt = input.status === VIDEO_STATUSES.PUBLISHED ? new Date() : undefined
    return videoRepository.create({ ...input, author: authorId, publishedAt })
  },

  async listOwnVideos(authorId: string) {
    return videoRepository.findByAuthor(authorId)
  },

  async listPublished(category?: string) {
    return videoRepository.findPublished(category)
  },

  // Public author profile page: only that author's published videos.
  async listPublishedByAuthor(authorId: string) {
    return videoRepository.findPublishedByAuthor(authorId)
  },

  async getVideoById(id: string, actingUser?: ActingUser) {
    const video = await videoRepository.findById(id)
    if (!video) {
      throw new AppError('Video not found.', 404)
    }

    if (video.status === VIDEO_STATUSES.PUBLISHED && video.visibility !== 'private') {
      const locked = await resolveVideoLock(video, actingUser)
      return { video, locked }
    }

    const isOwner = actingUser?.id === video.author.toString()
    const isPrivileged = actingUser?.role === ROLES.ADMIN || actingUser?.role === ROLES.EDITOR
    if (!isOwner && !isPrivileged) {
      throw new AppError('Video not found.', 404)
    }

    return { video, locked: false }
  },

  async updateVideo(
    id: string,
    actingUser: ActingUser,
    input: {
      title?: string
      description?: string
      category?: string
      tags?: string[]
      visibility?: VideoVisibility
      videoUrl?: string
      thumbnailUrl?: string
      duration?: number
    },
  ) {
    const video = await videoRepository.findById(id)
    if (!video) {
      throw new AppError('Video not found.', 404)
    }
    assertCanManage(video, actingUser)
    await videoRepository.updateById(id, input)
  },

  // Authors publish/unpublish their own video immediately — same
  // no-review-gate policy as articles, and applies to editors too.
  async updateStatus(id: string, status: VideoStatus, actingUser: ActingUser) {
    const video = await videoRepository.findById(id)
    if (!video) {
      throw new AppError('Video not found.', 404)
    }
    assertCanManage(video, actingUser)
    await videoRepository.updateStatus(id, status)
  },

  async deleteVideo(id: string, actingUser: ActingUser) {
    const video = await videoRepository.findById(id)
    if (!video) {
      throw new AppError('Video not found.', 404)
    }
    assertCanManage(video, actingUser)
    await videoRepository.deleteById(id)
  },

  async recordView(id: string, viewerId?: string) {
    const video = await videoRepository.findById(id)
    if (!video || video.status !== VIDEO_STATUSES.PUBLISHED) {
      throw new AppError('Video not found.', 404)
    }
    await videoRepository.incrementViews(id)

    if (viewerId) {
      await userRepository.recordVideoWatch(viewerId, id)

      const viewer = await userRepository.findById(viewerId)
      if (viewer?.plan === 'free') {
        await userRepository.incrementVideosWatched(viewerId)
      }
    }
  },

  // Public author-profile page: a reader's liked videos (used in place of
  // "authored videos" for the reader role, since readers don't publish).
  async listLikedByUser(userId: string) {
    return videoRepository.findLikedByUser(userId)
  },

  async toggleLike(id: string, userId: string) {
    const result = await videoRepository.toggleLike(id, userId)
    if (!result) {
      throw new AppError('Video not found.', 404)
    }
    return result
  },

  async toggleBookmark(id: string, userId: string) {
    const result = await videoRepository.toggleBookmark(id, userId)
    if (!result) {
      throw new AppError('Video not found.', 404)
    }
    return result
  },

  async listBookmarked(userId: string) {
    return videoRepository.findBookmarkedByUser(userId)
  },
}

export const VIDEO_CREATOR_ROLES: Role[] = [ROLES.AUTHOR, ROLES.EDITOR, ROLES.ADMIN]
