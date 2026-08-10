import { Types } from 'mongoose'
import { Article, type ArticleDocument } from '../models/Article.js'
import type { ArticleStatus } from '../constants/articleStatus.js'
import { ARTICLE_STATUSES } from '../constants/articleStatus.js'

export interface ToggleLikeResult {
  likesCount: number
  liked: boolean
}

export interface CreateArticleInput {
  title: string
  slug: string
  excerpt: string
  body: string
  category: string
  tags?: string[]
  status: ArticleStatus
  author: string
  articleImageUrl?: string
  articleVideoUrl?: string
  videoThumbnailUrl?: string
  socialLinks?: string[]
  sourceLinks?: string[]
  publishedAt?: Date
}

export interface UpdateArticleInput {
  title?: string
  slug?: string
  excerpt?: string
  body?: string
  category?: string
  tags?: string[]
  articleImageUrl?: string
  articleVideoUrl?: string
  videoThumbnailUrl?: string
  socialLinks?: string[]
  sourceLinks?: string[]
}

export const articleRepository = {
  async findById(id: string): Promise<ArticleDocument | null> {
    return Article.findById(id)
  },

  async findByAuthor(authorId: string): Promise<ArticleDocument[]> {
    return Article.find({ author: authorId }).sort({ createdAt: -1 })
  },

  async findByStatus(status: ArticleStatus): Promise<ArticleDocument[]> {
    return Article.find({ status }).sort({ createdAt: -1 })
  },

  async findPublished(): Promise<ArticleDocument[]> {
    return Article.find({ status: ARTICLE_STATUSES.PUBLISHED })
      .sort({ publishedAt: -1 })
      .populate('author', 'name')
  },

  async findPublishedByCategory(category: string): Promise<ArticleDocument[]> {
    return Article.find({ status: ARTICLE_STATUSES.PUBLISHED, category })
      .sort({ publishedAt: -1 })
      .populate('author', 'name')
  },

  async findPublishedByTag(tag: string): Promise<ArticleDocument[]> {
    return Article.find({ status: ARTICLE_STATUSES.PUBLISHED, tags: tag })
      .sort({ publishedAt: -1 })
      .populate('author', 'name')
  },

  // The single published article with the most likes is promoted to the
  // homepage featured slot. Falls back to the most recently published
  // article when nothing has any likes yet.
  async findFeatured(): Promise<ArticleDocument | null> {
    return Article.findOne({ status: ARTICLE_STATUSES.PUBLISHED })
      .sort({ likesCount: -1, publishedAt: -1 })
      .populate('author', 'name')
  },

  async findBySlug(slug: string): Promise<ArticleDocument | null> {
    return Article.findOne({ slug }).populate('author', 'name')
  },

  async findAll(): Promise<ArticleDocument[]> {
    return Article.find().sort({ createdAt: -1 })
  },

  async create(input: CreateArticleInput): Promise<ArticleDocument> {
    return Article.create(input)
  },

  async updateById(id: string, input: UpdateArticleInput): Promise<void> {
    await Article.updateOne({ _id: id }, { $set: input })
  },

  async updateStatus(id: string, status: ArticleStatus): Promise<void> {
    const set: Record<string, unknown> = { status }
    if (status === ARTICLE_STATUSES.PUBLISHED) {
      set.publishedAt = new Date()
    }
    await Article.updateOne({ _id: id }, { $set: set })
  },

  async incrementViews(id: string): Promise<void> {
    await Article.updateOne({ _id: id }, { $inc: { views: 1 } })
  },

  // Toggles a single user's like on an article. Returns null if the article
  // doesn't exist so the service can turn that into a 404.
  async toggleLike(id: string, userId: string): Promise<ToggleLikeResult | null> {
    const article = await Article.findById(id)
    if (!article) return null

    const alreadyLiked = article.likedBy.some((likerId) => likerId.toString() === userId)
    if (alreadyLiked) {
      article.likedBy = article.likedBy.filter((likerId) => likerId.toString() !== userId)
      article.likesCount = Math.max(0, article.likesCount - 1)
    } else {
      article.likedBy.push(new Types.ObjectId(userId))
      article.likesCount += 1
    }
    await article.save()

    return { likesCount: article.likesCount, liked: !alreadyLiked }
  },

  async setFactCheckPending(id: string): Promise<void> {
    await Article.updateOne(
      { _id: id },
      { $set: { factCheckStatus: 'pending' }, $unset: { factCheckRejectionReason: 1 } },
    )
  },

  async setFactCheckApproved(id: string): Promise<void> {
    await Article.updateOne(
      { _id: id },
      { $set: { factCheckStatus: 'approved', factCheckReviewedAt: new Date() }, $unset: { factCheckRejectionReason: 1 } },
    )
  },

  async setFactCheckRejected(id: string, reason: string): Promise<void> {
    await Article.updateOne(
      { _id: id },
      {
        $set: {
          factCheckStatus: 'rejected',
          factCheckRejectionReason: reason,
          factCheckReviewedAt: new Date(),
        },
      },
    )
  },

  async deleteById(id: string): Promise<void> {
    await Article.deleteOne({ _id: id })
  },
}
