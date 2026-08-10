import { Schema, model, Types, type HydratedDocument } from 'mongoose'
import { ALL_ARTICLE_STATUSES, ARTICLE_STATUSES, type ArticleStatus } from '../constants/articleStatus.js'

export const FACT_CHECK_STATUSES = ['none', 'pending', 'approved', 'rejected'] as const
export type ArticleFactCheckStatus = (typeof FACT_CHECK_STATUSES)[number]

export interface IArticle {
  title: string
  slug: string
  excerpt: string
  body: string
  category: string
  tags: string[]
  status: ArticleStatus
  author: Types.ObjectId
  views: number
  articleImageUrl?: string
  articleVideoUrl?: string
  videoThumbnailUrl?: string
  socialLinks: string[]
  sourceLinks: string[]
  publishedAt?: Date
  factCheckStatus: ArticleFactCheckStatus
  factCheckRejectionReason?: string
  factCheckReviewedAt?: Date
  likedBy: Types.ObjectId[]
  likesCount: number
  createdAt: Date
  updatedAt: Date
}

export type ArticleDocument = HydratedDocument<IArticle>

const articleSchema = new Schema<IArticle>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 200,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    excerpt: {
      type: String,
      trim: true,
      maxlength: 400,
      default: '',
    },
    body: {
      type: String,
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
      enum: ALL_ARTICLE_STATUSES,
      default: ARTICLE_STATUSES.DRAFT,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    articleImageUrl: { type: String },
    articleVideoUrl: { type: String },
    videoThumbnailUrl: { type: String },
    socialLinks: { type: [String], default: [] },
    sourceLinks: { type: [String], default: [] },
    publishedAt: { type: Date },
    factCheckStatus: {
      type: String,
      enum: FACT_CHECK_STATUSES,
      default: 'none',
    },
    factCheckRejectionReason: { type: String, trim: true, maxlength: 500 },
    factCheckReviewedAt: { type: Date },
    likedBy: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
    likesCount: { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = String(ret._id)
        ret.likes = ret.likesCount ?? 0
        delete ret._id
        delete ret.__v
        delete ret.likedBy
        delete ret.likesCount
        return ret
      },
    },
  },
)

articleSchema.index({ status: 1, createdAt: -1 })
articleSchema.index({ author: 1, createdAt: -1 })
articleSchema.index({ status: 1, likesCount: -1 })
articleSchema.index({ status: 1, category: 1, publishedAt: -1 })
articleSchema.index({ status: 1, tags: 1, publishedAt: -1 })

export const Article = model<IArticle>('Article', articleSchema)
