import { Types } from 'mongoose'
import { Video, type VideoDocument } from '../models/Video.js'
import type { VideoStatus, VideoVisibility } from '../constants/videoStatus.js'
import { VIDEO_STATUSES } from '../constants/videoStatus.js'

export interface ToggleVideoLikeResult {
  likesCount: number
  liked: boolean
}

export interface ToggleVideoBookmarkResult {
  bookmarksCount: number
  bookmarked: boolean
}

export interface CreateVideoInput {
  title: string
  description?: string
  category: string
  tags?: string[]
  status: VideoStatus
  visibility?: VideoVisibility
  videoUrl: string
  thumbnailUrl?: string
  duration?: number
  author: string
  publishedAt?: Date
}

export interface UpdateVideoInput {
  title?: string
  description?: string
  category?: string
  tags?: string[]
  visibility?: VideoVisibility
  videoUrl?: string
  thumbnailUrl?: string
  duration?: number
}

export const videoRepository = {
  async findById(id: string): Promise<VideoDocument | null> {
    return Video.findById(id)
  },

  async findByAuthor(authorId: string): Promise<VideoDocument[]> {
    return Video.find({ author: authorId }).sort({ createdAt: -1 })
  },

  async findPublished(category?: string): Promise<VideoDocument[]> {
    return Video.find({
      status: VIDEO_STATUSES.PUBLISHED,
      visibility: 'public',
      ...(category ? { category } : {}),
    })
      .sort({ publishedAt: -1 })
      .populate('author', 'name')
  },

  // Public author profile page: only that author's published, public videos.
  async findPublishedByAuthor(authorId: string): Promise<VideoDocument[]> {
    return Video.find({ status: VIDEO_STATUSES.PUBLISHED, visibility: 'public', author: authorId })
      .sort({ publishedAt: -1 })
      .populate('author', 'name')
  },

  async countPublishedByAuthor(authorId: string): Promise<number> {
    return Video.countDocuments({
      status: VIDEO_STATUSES.PUBLISHED,
      visibility: 'public',
      author: authorId,
    })
  },

  // Public author-profile "Library" tab: every published, public video a
  // given user has liked.
  async findLikedByUser(userId: string): Promise<VideoDocument[]> {
    return Video.find({ likedBy: userId, status: VIDEO_STATUSES.PUBLISHED, visibility: 'public' })
      .sort({ createdAt: -1 })
      .populate('author', 'name')
  },

  // Reader public-profile stats card.
  async countLikedByUser(userId: string): Promise<number> {
    return Video.countDocuments({ likedBy: userId, status: VIDEO_STATUSES.PUBLISHED, visibility: 'public' })
  },

  async findAll(): Promise<VideoDocument[]> {
    return Video.find().sort({ createdAt: -1 })
  },

  async create(input: CreateVideoInput): Promise<VideoDocument> {
    return Video.create(input)
  },

  async updateById(id: string, input: UpdateVideoInput): Promise<void> {
    await Video.updateOne({ _id: id }, { $set: input })
  },

  async updateStatus(id: string, status: VideoStatus): Promise<void> {
    const set: Record<string, unknown> = { status }
    if (status === VIDEO_STATUSES.PUBLISHED) {
      set.publishedAt = new Date()
    }
    await Video.updateOne({ _id: id }, { $set: set })
  },

  async incrementViews(id: string): Promise<void> {
    await Video.updateOne({ _id: id }, { $inc: { views: 1 } })
  },

  async toggleLike(id: string, userId: string): Promise<ToggleVideoLikeResult | null> {
    const video = await Video.findById(id)
    if (!video) return null

    const alreadyLiked = video.likedBy.some((likerId) => likerId.toString() === userId)
    if (alreadyLiked) {
      video.likedBy = video.likedBy.filter((likerId) => likerId.toString() !== userId)
      video.likesCount = Math.max(0, video.likesCount - 1)
    } else {
      video.likedBy.push(new Types.ObjectId(userId))
      video.likesCount += 1
    }
    await video.save()

    return { likesCount: video.likesCount, liked: !alreadyLiked }
  },

  async toggleBookmark(id: string, userId: string): Promise<ToggleVideoBookmarkResult | null> {
    const video = await Video.findById(id)
    if (!video) return null

    const alreadyBookmarked = video.bookmarkedBy.some((entry) => entry.user.toString() === userId)
    if (alreadyBookmarked) {
      video.bookmarkedBy = video.bookmarkedBy.filter((entry) => entry.user.toString() !== userId)
      video.bookmarksCount = Math.max(0, video.bookmarksCount - 1)
    } else {
      video.bookmarkedBy.push({ user: new Types.ObjectId(userId), savedAt: new Date() })
      video.bookmarksCount += 1
    }
    await video.save()

    return { bookmarksCount: video.bookmarksCount, bookmarked: !alreadyBookmarked }
  },

  async findBookmarkedByUser(userId: string): Promise<Array<{ video: VideoDocument; savedAt: Date }>> {
    const videos = await Video.find({ 'bookmarkedBy.user': userId }).populate('author', 'name')
    return videos.map((video) => {
      const entry = video.bookmarkedBy.find((item) => item.user.toString() === userId)
      return { video, savedAt: entry?.savedAt ?? video.updatedAt }
    })
  },

  async deleteById(id: string): Promise<void> {
    await Video.deleteOne({ _id: id })
  },
}
