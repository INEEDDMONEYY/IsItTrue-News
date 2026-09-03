import { Schema, model, Types, type HydratedDocument } from 'mongoose'
import {
  ALL_VIDEO_STATUSES,
  VIDEO_STATUSES,
  VIDEO_VISIBILITIES,
  type VideoStatus,
  type VideoVisibility,
} from '../constants/videoStatus.js'

export interface IVideoBookmark {
  user: Types.ObjectId
  savedAt: Date
}

export interface IVideo {
  title: string
  description: string
  category: string
  tags: string[]
  status: VideoStatus
  visibility: VideoVisibility
  videoUrl: string
  thumbnailUrl?: string
  duration: number
  author: Types.ObjectId
  views: number
  likedBy: Types.ObjectId[]
  likesCount: number
  bookmarkedBy: IVideoBookmark[]
  bookmarksCount: number
  commentsCount: number
  publishedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export type VideoDocument = HydratedDocument<IVideo>

const videoSchema = new Schema<IVideo>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: '',
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ALL_VIDEO_STATUSES,
      default: VIDEO_STATUSES.DRAFT,
    },
    visibility: {
      type: String,
      enum: VIDEO_VISIBILITIES,
      default: 'public',
    },
    videoUrl: { type: String, required: true },
    thumbnailUrl: { type: String },
    duration: { type: Number, default: 0, min: 0 },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    views: { type: Number, default: 0, min: 0 },
    likedBy: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
    likesCount: { type: Number, default: 0, min: 0 },
    bookmarkedBy: {
      type: [
        new Schema(
          {
            user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
            savedAt: { type: Date, default: Date.now },
          },
          { _id: false },
        ),
      ],
      default: [],
    },
    bookmarksCount: { type: Number, default: 0, min: 0 },
    commentsCount: { type: Number, default: 0, min: 0 },
    publishedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = String(ret._id)
        ret.likes = ret.likesCount ?? 0
        ret.bookmarks = ret.bookmarksCount ?? 0
        ret.comments = ret.commentsCount ?? 0
        delete ret._id
        delete ret.__v
        delete ret.likedBy
        delete ret.likesCount
        delete ret.bookmarkedBy
        delete ret.bookmarksCount
        delete ret.commentsCount
        return ret
      },
    },
  },
)

videoSchema.index({ status: 1, createdAt: -1 })
videoSchema.index({ author: 1, createdAt: -1 })
videoSchema.index({ status: 1, category: 1, publishedAt: -1 })

export const Video = model<IVideo>('Video', videoSchema)
