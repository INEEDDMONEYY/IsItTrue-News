import { Types } from 'mongoose'
import { Article, type ArticleDocument } from '../models/Article.js'
import type { ArticleStatus } from '../constants/articleStatus.js'
import { ARTICLE_STATUSES } from '../constants/articleStatus.js'

export interface ToggleLikeResult {
  likesCount: number
  liked: boolean
}

export interface ToggleDislikeResult {
  dislikesCount: number
  disliked: boolean
}

export interface ToggleBookmarkResult {
  bookmarksCount: number
  bookmarked: boolean
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

  // Public author profile page: only that author's published work is visible.
  async findPublishedByAuthor(authorId: string): Promise<ArticleDocument[]> {
    return Article.find({ status: ARTICLE_STATUSES.PUBLISHED, author: authorId })
      .sort({ publishedAt: -1 })
      .populate('author', 'name')
  },

  async countPublishedByAuthor(authorId: string): Promise<number> {
    return Article.countDocuments({ status: ARTICLE_STATUSES.PUBLISHED, author: authorId })
  },

  async countVerifiedByAuthor(authorId: string): Promise<number> {
    return Article.countDocuments({
      status: ARTICLE_STATUSES.PUBLISHED,
      author: authorId,
      factCheckStatus: 'approved',
    })
  },

  // Public author-profile "Library" tab: every published article a given
  // user has liked.
  async findLikedByUser(userId: string): Promise<ArticleDocument[]> {
    return Article.find({ likedBy: userId, status: ARTICLE_STATUSES.PUBLISHED })
      .sort({ createdAt: -1 })
      .populate('author', 'name')
  },

  // Reader public-profile stats card.
  async countLikedByUser(userId: string): Promise<number> {
    return Article.countDocuments({ likedBy: userId, status: ARTICLE_STATUSES.PUBLISHED })
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
    return Article.findOne({ slug })
      .populate('author', 'name')
      .populate('factCheckReviewedBy', 'name')
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

  // Toggles a single user's like on an article. Liking removes any existing
  // dislike from the same user, since the two are mutually exclusive.
  // Returns null if the article doesn't exist so the service can turn that
  // into a 404.
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

      const wasDisliked = article.dislikedBy.some((id) => id.toString() === userId)
      if (wasDisliked) {
        article.dislikedBy = article.dislikedBy.filter((id) => id.toString() !== userId)
        article.dislikesCount = Math.max(0, article.dislikesCount - 1)
      }
    }
    await article.save()

    return { likesCount: article.likesCount, liked: !alreadyLiked }
  },

  // Mirrors toggleLike: disliking removes any existing like from the same user.
  async toggleDislike(id: string, userId: string): Promise<ToggleDislikeResult | null> {
    const article = await Article.findById(id)
    if (!article) return null

    const alreadyDisliked = article.dislikedBy.some((id) => id.toString() === userId)
    if (alreadyDisliked) {
      article.dislikedBy = article.dislikedBy.filter((id) => id.toString() !== userId)
      article.dislikesCount = Math.max(0, article.dislikesCount - 1)
    } else {
      article.dislikedBy.push(new Types.ObjectId(userId))
      article.dislikesCount += 1

      const wasLiked = article.likedBy.some((likerId) => likerId.toString() === userId)
      if (wasLiked) {
        article.likedBy = article.likedBy.filter((likerId) => likerId.toString() !== userId)
        article.likesCount = Math.max(0, article.likesCount - 1)
      }
    }
    await article.save()

    return { dislikesCount: article.dislikesCount, disliked: !alreadyDisliked }
  },

  // Shares aren't tied to a single user/toggle — every share click just
  // increments the count, same as a view.
  async incrementShares(id: string): Promise<number | null> {
    const article = await Article.findByIdAndUpdate(
      id,
      { $inc: { sharesCount: 1 } },
      { new: true },
    )
    return article ? article.sharesCount : null
  },

  // Toggles a single user's bookmark on an article — independent of
  // like/dislike, and tracks when it was saved so "my bookmarks" can be
  // sorted by save date.
  async toggleBookmark(id: string, userId: string): Promise<ToggleBookmarkResult | null> {
    const article = await Article.findById(id)
    if (!article) return null

    const alreadyBookmarked = article.bookmarkedBy.some((entry) => entry.user.toString() === userId)
    if (alreadyBookmarked) {
      article.bookmarkedBy = article.bookmarkedBy.filter((entry) => entry.user.toString() !== userId)
      article.bookmarksCount = Math.max(0, article.bookmarksCount - 1)
    } else {
      article.bookmarkedBy.push({ user: new Types.ObjectId(userId), savedAt: new Date() })
      article.bookmarksCount += 1
    }
    await article.save()

    return { bookmarksCount: article.bookmarksCount, bookmarked: !alreadyBookmarked }
  },

  // Every published article a user has bookmarked, along with the moment
  // they saved it (used to sort/display "my bookmarks").
  async findBookmarkedByUser(userId: string): Promise<Array<{ article: ArticleDocument; savedAt: Date }>> {
    const articles = await Article.find({ 'bookmarkedBy.user': userId }).populate('author', 'name')
    return articles.map((article) => {
      const entry = article.bookmarkedBy.find((item) => item.user.toString() === userId)
      return { article, savedAt: entry?.savedAt ?? article.updatedAt }
    })
  },

  async setFactCheckPending(id: string): Promise<void> {
    await Article.updateOne(
      { _id: id },
      { $set: { factCheckStatus: 'pending' }, $unset: { factCheckRejectionReason: 1 } },
    )
  },

  async setFactCheckApproved(id: string, reviewedBy: string): Promise<ArticleDocument | null> {
    return Article.findOneAndUpdate(
      { _id: id },
      {
        $set: { factCheckStatus: 'approved', factCheckReviewedAt: new Date(), factCheckReviewedBy: reviewedBy },
        $unset: { factCheckRejectionReason: 1 },
      },
      { new: true },
    )
  },

  async setFactCheckRejected(id: string, reason: string, reviewedBy: string): Promise<ArticleDocument | null> {
    return Article.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          factCheckStatus: 'rejected',
          factCheckRejectionReason: reason,
          factCheckReviewedAt: new Date(),
          factCheckReviewedBy: reviewedBy,
        },
      },
      { new: true },
    )
  },

  async deleteById(id: string): Promise<void> {
    await Article.deleteOne({ _id: id })
  },
}
