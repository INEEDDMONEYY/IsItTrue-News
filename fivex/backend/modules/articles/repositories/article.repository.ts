import { Types } from 'mongoose'
import { Article, type ArticleDocument } from '../models/Article.js'
import type { ArticleStatus } from '../constants/articleStatus.js'
import { ARTICLE_STATUSES } from '../constants/articleStatus.js'
import type { ArticleEditorialStage } from '../constants/editorialWorkflow.js'

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
  submittedAt?: Date
  editorialStage?: ArticleEditorialStage
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
    return Article.find({ author: authorId }).sort({ createdAt: -1 }).populate('reviewedBy', 'name')
  },

  async findByStatus(status: ArticleStatus): Promise<ArticleDocument[]> {
    return Article.find({ status })
      .sort({ submittedAt: 1, createdAt: 1 })
      .populate('author', 'name')
      .populate('reviewedBy', 'name')
  },

  async findEditorialWorkflow(): Promise<ArticleDocument[]> {
    return Article.find()
      .select(
        '_id title slug category status factCheckStatus editorialStage editorialDeadline submittedAt publishedAt createdAt updatedAt author',
      )
      .sort({ editorialDeadline: 1, updatedAt: -1 })
      .populate('author', 'name')
  },

  // Drafts an editor has sent back and the author hasn't resubmitted yet.
  async findChangesRequested(): Promise<ArticleDocument[]> {
    return Article.find({ status: ARTICLE_STATUSES.DRAFT, reviewedAt: { $exists: true } })
      .sort({ reviewedAt: -1 })
      .populate('author', 'name')
      .populate('reviewedBy', 'name')
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
    const set: Record<string, unknown> = {
      status,
      editorialStage:
        status === ARTICLE_STATUSES.PUBLISHED
          ? 'published'
          : status === ARTICLE_STATUSES.PENDING_REVIEW
            ? 'submitted'
            : 'draft',
    }
    if (status === ARTICLE_STATUSES.PUBLISHED) {
      set.publishedAt = new Date()
    }
    if (status === ARTICLE_STATUSES.PENDING_REVIEW) {
      set.submittedAt = new Date()
    }
    await Article.updateOne({ _id: id }, { $set: set })
  },

  async updateEditorialWorkflow(
    id: string,
    workflow: { editorialStage: ArticleEditorialStage; editorialDeadline: string | null },
  ): Promise<void> {
    await Article.updateOne(
      { _id: id },
      {
        $set: {
          editorialStage: workflow.editorialStage,
          ...(workflow.editorialDeadline
            ? { editorialDeadline: new Date(`${workflow.editorialDeadline}T00:00:00.000Z`) }
            : {}),
        },
        ...(workflow.editorialDeadline === null ? { $unset: { editorialDeadline: 1 } } : {}),
      },
    )
  },

  // Editor decision: approving publishes it (and clears any earlier feedback);
  // requesting changes sends it back to the author as a draft carrying the
  // editor's checklist and note.
  async recordReview(
    id: string,
    decision: {
      status: ArticleStatus
      reviewerId: string
      note?: string
      requirements?: string[]
    },
  ): Promise<void> {
    const set: Record<string, unknown> = {
      status: decision.status,
      editorialStage: decision.status === ARTICLE_STATUSES.PUBLISHED ? 'published' : 'draft',
      reviewedBy: decision.reviewerId,
      reviewedAt: new Date(),
    }
    const unset: Record<string, 1> = {}

    if (decision.status === ARTICLE_STATUSES.PUBLISHED) {
      set.publishedAt = new Date()
      set.reviewRequirements = []
      unset.reviewNote = 1
    } else {
      set.reviewRequirements = (decision.requirements ?? []).map((text) => ({ text, done: false }))
      if (decision.note) {
        set.reviewNote = decision.note
      } else {
        unset.reviewNote = 1
      }
    }

    await Article.updateOne(
      { _id: id },
      Object.keys(unset).length > 0 ? { $set: set, $unset: unset } : { $set: set },
    )
  },

  // Returns false when the article has no requirement with that id.
  async setRequirementDone(articleId: string, requirementId: string, done: boolean): Promise<boolean> {
    const result = await Article.updateOne(
      { _id: articleId, 'reviewRequirements._id': requirementId },
      { $set: { 'reviewRequirements.$.done': done } },
    )
    return result.matchedCount > 0
  },

  // Appends a numbered correction notice (1, 2, 3...) to the article and returns its number.
  async addPublishedCorrection(id: string, text: string, publishedAt: Date): Promise<number | null> {
    const counted = await Article.findByIdAndUpdate(id, { $inc: { correctionsCount: 1 } }, { new: true }).select(
      'correctionsCount',
    )
    if (!counted) return null

    await Article.updateOne(
      { _id: id },
      { $push: { corrections: { number: counted.correctionsCount, text, publishedAt } } },
    )
    return counted.correctionsCount
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

  // Articles an editor can fact-check: anything that has left the author's drafts.
  async findForFactCheckOversight(): Promise<ArticleDocument[]> {
    return Article.find({ status: { $in: [ARTICLE_STATUSES.PENDING_REVIEW, ARTICLE_STATUSES.PUBLISHED] } })
      .select(
        '_id title slug status factCheckStatus factCheckRejectionReason factCheckReviewedAt factCheckReviewedBy author updatedAt',
      )
      .sort({ updatedAt: -1 })
      .limit(300)
      .populate('author', 'name')
      .populate('factCheckReviewedBy', 'name')
  },

  // Editor verification. Never overrides an admin's rejection (see the service).
  async setFactCheckVerified(id: string, reviewedBy: string): Promise<void> {
    await Article.updateOne(
      { _id: id, factCheckStatus: { $in: ['none', 'pending', 'approved'] } },
      {
        $set: { factCheckStatus: 'approved', factCheckReviewedAt: new Date(), factCheckReviewedBy: reviewedBy },
        $unset: { factCheckRejectionReason: 1 },
      },
    )
  },

  // Only an approved check is withdrawn; pending/rejected states belong to the admin review.
  async clearFactCheckApproval(id: string): Promise<void> {
    await Article.updateOne(
      { _id: id, factCheckStatus: 'approved' },
      { $set: { factCheckStatus: 'none' }, $unset: { factCheckReviewedAt: 1, factCheckReviewedBy: 1 } },
    )
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
