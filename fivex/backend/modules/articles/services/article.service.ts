import { AppError } from '../../../shared/errors/AppError.js'
import { ROLES, type Role } from '../../../shared/constants/roles.js'
import { FREE_PLAN_LIMITS } from '../../../shared/constants/plan.js'
import { hasPremiumAccess } from '../../../shared/constants/features.js'
import { slugify } from '../../../utils/slug.js'
import { articleRepository } from '../repositories/article.repository.js'
import { userRepository } from '../../users/repositories/user.repository.js'
import { ARTICLE_STATUSES, type ArticleStatus } from '../constants/articleStatus.js'
import type { ArticleEditorialStage } from '../constants/editorialWorkflow.js'
import type { ArticleDocument } from '../models/Article.js'
import { tagService } from '../../tags/services/tag.service.js'
import { categoryService } from '../../categories/services/category.service.js'
import { notificationService } from '../../notifications/services/notification.service.js'
import { logger } from '../../../config/logger.js'
import type { RequestChangesInput } from '../validations/article.validation.js'

interface ActingUser {
  id: string
  role: Role
}

function canPublishDirectly(actingUser: ActingUser) {
  return actingUser.role === ROLES.ADMIN || actingUser.role === ROLES.EDITOR
}

// Notifying is a side effect — a failure here must never fail the submission itself.
async function notifyEditorsOfSubmission(article: ArticleDocument, author: ActingUser) {
  try {
    const [editorIds, submitter] = await Promise.all([
      userRepository.findIdsByRole(ROLES.EDITOR),
      userRepository.findById(author.id),
    ])
    const authorName = submitter?.name ?? 'An author'

    await Promise.all(
      editorIds.map((editorId) =>
        notificationService.notify({
          recipient: editorId,
          type: 'editorial',
          title: 'New article awaiting approval',
          message: `"${article.title}" by ${authorName} was submitted for editorial review.`,
          priority: 'high',
          action: 'review',
          actionLabel: 'Review article',
          href: '/dashboard/approvals',
          relatedId: article._id.toString(),
          relatedType: 'article',
          actor: { id: author.id, name: authorName },
        }),
      ),
    )
  } catch (error) {
    logger.error('Failed to notify editors of a new submission.', error)
  }
}

async function notifyAuthorOfDecision(
  article: ArticleDocument,
  reviewer: ActingUser,
  decision: { approved: true } | { approved: false; requirementCount: number; note?: string },
) {
  try {
    const reviewerUser = await userRepository.findById(reviewer.id)
    const approved = decision.approved
    const changesSummary = decision.approved
      ? ''
      : [
          decision.requirementCount > 0
            ? `${decision.requirementCount} requirement${decision.requirementCount === 1 ? '' : 's'} to complete.`
            : '',
          decision.note ? `Editor note: ${decision.note}` : '',
        ]
          .filter(Boolean)
          .join(' ')

    await notificationService.notify({
      recipient: article.author.toString(),
      type: 'editorial',
      title: approved ? 'Your article was approved' : 'Changes requested on your article',
      message: approved
        ? `"${article.title}" was approved and is now published.`
        : `"${article.title}" was returned to your drafts. ${changesSummary}`.slice(0, 500),
      priority: approved ? 'normal' : 'high',
      action: approved ? 'view' : 'manage',
      actionLabel: approved ? 'View article' : 'See requirements',
      href: approved ? `/article/${article.slug}` : '/dashboard/drafts',
      relatedId: article._id.toString(),
      relatedType: 'article',
      ...(reviewerUser ? { actor: { id: reviewer.id, name: reviewerUser.name } } : {}),
    })
  } catch (error) {
    logger.error('Failed to notify author of an editorial decision.', error)
  }
}

function assertCanManage(article: ArticleDocument, actingUser: ActingUser) {
  const isOwner = article.author.toString() === actingUser.id
  const isPrivileged = actingUser.role === ROLES.ADMIN || actingUser.role === ROLES.EDITOR
  if (!isOwner && !isPrivileged) {
    throw new AppError('You do not have permission to modify this article.', 403)
  }
}

// Headlines/excerpts, author profiles, and comments are always unlimited —
// only the full article body is gated. Anonymous readers always get the
// locked preview; signed-in free-plan readers get FREE_PLAN_LIMITS.articlesPerMonth
// distinct unlocks per month; the article's own author/editors/admins/premium
// readers are never gated.
async function resolveArticleLock(
  article: ArticleDocument,
  actingUser?: ActingUser,
): Promise<boolean> {
  const isOwner = actingUser?.id === article.author.toString()
  const isPrivileged = actingUser?.role === ROLES.ADMIN || actingUser?.role === ROLES.EDITOR
  if (isOwner || isPrivileged) return false

  if (!actingUser) return true

  const viewer = await userRepository.findById(actingUser.id)
  if (!viewer || hasPremiumAccess('unlimitedArticles', viewer.plan)) return false


  await userRepository.resetUsageIfNeeded(actingUser.id)
  const fresh = await userRepository.findById(actingUser.id)
  const articleId = article._id.toString()
  const unlockedIds = fresh?.usage?.unlockedArticleIds ?? []
  const alreadyUnlocked = unlockedIds.some((oid) => oid.toString() === articleId)
  if (alreadyUnlocked) return false

  if (unlockedIds.length >= FREE_PLAN_LIMITS.articlesPerMonth) {
    return true
  }

  await userRepository.unlockArticleForUser(actingUser.id, articleId)
  return false
}

export const articleService = {
  async createArticle(
    author: ActingUser,
    input: {
      title: string
      excerpt: string
      body: string
      category: string
      tags?: string[]
      status: ArticleStatus
      articleImageUrl?: string
      articleVideoUrl?: string
      videoThumbnailUrl?: string
      socialLinks?: string[]
      sourceLinks?: string[]
    },
  ) {
    const slug = `${slugify(input.title) || 'article'}-${Date.now()}`
    const tags = input.tags?.length ? await tagService.normalizeTags(input.tags) : []

    // Only editors/admins can publish outright; an author asking for "published"
    // goes through the editorial queue instead.
    const status =
      input.status === ARTICLE_STATUSES.PUBLISHED && !canPublishDirectly(author)
        ? ARTICLE_STATUSES.PENDING_REVIEW
        : input.status

    const now = new Date()
    const article = await articleRepository.create({
      ...input,
      status,
      tags,
      slug,
      author: author.id,
      publishedAt: status === ARTICLE_STATUSES.PUBLISHED ? now : undefined,
      submittedAt: status === ARTICLE_STATUSES.PENDING_REVIEW ? now : undefined,
      editorialStage:
        status === ARTICLE_STATUSES.PENDING_REVIEW
          ? 'submitted'
          : status === ARTICLE_STATUSES.PUBLISHED
            ? 'published'
            : 'draft',
    })

    if (status === ARTICLE_STATUSES.PENDING_REVIEW) {
      await notifyEditorsOfSubmission(article, author)
    }

    return article
  },

  async listOwnArticles(authorId: string) {
    return articleRepository.findByAuthor(authorId)
  },

  async listPendingReview() {
    return articleRepository.findByStatus(ARTICLE_STATUSES.PENDING_REVIEW)
  },

  async listEditorialWorkflow() {
    const articles = await articleRepository.findEditorialWorkflow()
    return articles.map((article) => ({
      ...article.toJSON(),
      editorialStage:
        article.editorialStage ??
        (article.status === ARTICLE_STATUSES.PUBLISHED
          ? 'published'
          : article.status === ARTICLE_STATUSES.PENDING_REVIEW
            ? 'submitted'
            : 'draft'),
    }))
  },

  async updateEditorialWorkflow(
    id: string,
    actingUser: ActingUser,
    workflow: { editorialStage: ArticleEditorialStage; editorialDeadline: string | null },
  ) {
    if (actingUser.role !== ROLES.EDITOR && actingUser.role !== ROLES.ADMIN) {
      throw new AppError('Only an editor or admin can update editorial workflow.', 403)
    }
    const article = await articleRepository.findById(id)
    if (!article) throw new AppError('Article not found.', 404)
    await articleRepository.updateEditorialWorkflow(id, {
      editorialStage: workflow.editorialStage,
      editorialDeadline: workflow.editorialDeadline,
    })
  },

  async listPublished() {
    return articleRepository.findPublished()
  },

  // Category/tag pages link using the slug; resolve it to the stored
  // display name before filtering (articles store the category/tag's name,
  // not its slug).
  async listPublishedByCategory(categorySlug: string) {
    const category = await categoryService.getBySlug(categorySlug)
    if (!category) return []
    return articleRepository.findPublishedByCategory(category.name)
  },

  async listPublishedByTag(tagSlug: string) {
    const tag = await tagService.getBySlug(tagSlug)
    if (!tag) return []
    return articleRepository.findPublishedByTag(tag.name)
  },

  // Public author profile page: only that author's published articles.
  async listPublishedByAuthor(authorId: string) {
    return articleRepository.findPublishedByAuthor(authorId)
  },

  async listAll() {
    return articleRepository.findAll()
  },

  // The homepage's featured slot: the published article with the most
  // likes, falling back to the most recent published article if none have
  // any likes yet (or nothing is published at all).
  async getFeatured() {
    return articleRepository.findFeatured()
  },

  // Public teaser list: the body is never sent, only a read-time estimate derived from it.
  async listLatestPublished(limit: number) {
    const articles = await articleRepository.findLatestPublished(limit)
    return articles.map((article) => {
      const words = article.body.trim().split(/\s+/).filter(Boolean).length
      const json = article.toJSON() as Record<string, unknown>
      delete json.body
      delete json.editorialStage
      delete json.editorialDeadline
      return { ...json, readTimeMinutes: Math.max(1, Math.ceil(words / 200)) }
    })
  },

  async getArticleById(id: string, actingUser?: ActingUser) {
    const article = await articleRepository.findById(id)
    if (!article) {
      throw new AppError('Article not found.', 404)
    }

    if (article.status === ARTICLE_STATUSES.PUBLISHED) {
      const locked = await resolveArticleLock(article, actingUser)
      return { article, locked }
    }

    const isOwner = actingUser?.id === article.author.toString()
    const isPrivileged =
      actingUser?.role === ROLES.ADMIN || actingUser?.role === ROLES.EDITOR
    if (!isOwner && !isPrivileged) {
      throw new AppError('Article not found.', 404)
    }

    return { article, locked: false }
  },

  async getArticleBySlug(slug: string, actingUser?: ActingUser) {
    const article = await articleRepository.findBySlug(slug)
    if (!article) {
      throw new AppError('Article not found.', 404)
    }

    if (article.status === ARTICLE_STATUSES.PUBLISHED) {
      const locked = await resolveArticleLock(article, actingUser)
      return { article, locked }
    }

    const isOwner = actingUser?.id === article.author.toString()
    const isPrivileged =
      actingUser?.role === ROLES.ADMIN || actingUser?.role === ROLES.EDITOR
    if (!isOwner && !isPrivileged) {
      throw new AppError('Article not found.', 404)
    }

    return { article, locked: false }
  },

  async toggleLike(id: string, userId: string) {
    const result = await articleRepository.toggleLike(id, userId)
    if (!result) {
      throw new AppError('Article not found.', 404)
    }
    return result
  },

  async toggleDislike(id: string, userId: string) {
    const result = await articleRepository.toggleDislike(id, userId)
    if (!result) {
      throw new AppError('Article not found.', 404)
    }
    return result
  },

  async incrementShare(id: string) {
    const sharesCount = await articleRepository.incrementShares(id)
    if (sharesCount === null) {
      throw new AppError('Article not found.', 404)
    }
    return sharesCount
  },

  async toggleBookmark(id: string, userId: string) {
    const result = await articleRepository.toggleBookmark(id, userId)
    if (!result) {
      throw new AppError('Article not found.', 404)
    }
    return result
  },

  async listBookmarked(userId: string) {
    return articleRepository.findBookmarkedByUser(userId)
  },

  async updateArticle(
    id: string,
    actingUser: ActingUser,
    input: {
      title?: string
      excerpt?: string
      body?: string
      category?: string
      tags?: string[]
      articleImageUrl?: string | null
      articleVideoUrl?: string | null
      videoThumbnailUrl?: string | null
      socialLinks?: string[]
      sourceLinks?: string[]
    },
  ) {
    const article = await articleRepository.findById(id)
    if (!article) {
      throw new AppError('Article not found.', 404)
    }
    assertCanManage(article, actingUser)

    // Authors can't change an article while an editor is reviewing it.
    const isPrivileged = actingUser.role === ROLES.ADMIN || actingUser.role === ROLES.EDITOR
    if (!isPrivileged && article.status === ARTICLE_STATUSES.PENDING_REVIEW) {
      throw new AppError('This article is in editorial review and cannot be edited right now.', 400)
    }

    const slug = input.title ? `${slugify(input.title) || 'article'}-${Date.now()}` : undefined
    const tags = input.tags ? await tagService.normalizeTags(input.tags) : undefined
    await articleRepository.updateById(id, {
      ...input,
      ...(tags ? { tags } : {}),
      ...(slug ? { slug } : {}),
    })
  },

  async updateStatus(id: string, status: ArticleStatus, actingUser: ActingUser) {
    const article = await articleRepository.findById(id)
    if (!article) {
      throw new AppError('Article not found.', 404)
    }

    // Authors can only move their own work between draft and in-review;
    // publishing is an editor/admin decision (see approve/reject below).
    assertCanManage(article, actingUser)
    if (status === ARTICLE_STATUSES.PUBLISHED && !canPublishDirectly(actingUser)) {
      throw new AppError('Articles must be approved by an editor before they are published.', 403)
    }

    await articleRepository.updateStatus(id, status)

    if (status === ARTICLE_STATUSES.PENDING_REVIEW && article.status !== ARTICLE_STATUSES.PENDING_REVIEW) {
      await notifyEditorsOfSubmission(article, { id: article.author.toString(), role: ROLES.AUTHOR })
    }
  },

  async approveArticle(id: string, reviewer: ActingUser) {
    const article = await articleRepository.findById(id)
    if (!article) {
      throw new AppError('Article not found.', 404)
    }
    if (article.status !== ARTICLE_STATUSES.PENDING_REVIEW) {
      throw new AppError('Only articles awaiting review can be approved.', 400)
    }

    await articleRepository.recordReview(id, { status: ARTICLE_STATUSES.PUBLISHED, reviewerId: reviewer.id })
    await notifyAuthorOfDecision(article, reviewer, { approved: true })
  },

  async requestChanges(id: string, reviewer: ActingUser, input: RequestChangesInput) {
    const article = await articleRepository.findById(id)
    if (!article) {
      throw new AppError('Article not found.', 404)
    }
    if (article.status !== ARTICLE_STATUSES.PENDING_REVIEW) {
      throw new AppError('Only articles awaiting review can be sent back.', 400)
    }

    await articleRepository.recordReview(id, {
      status: ARTICLE_STATUSES.DRAFT,
      reviewerId: reviewer.id,
      note: input.note,
      requirements: input.requirements,
    })
    await notifyAuthorOfDecision(article, reviewer, {
      approved: false,
      requirementCount: input.requirements.length,
      note: input.note,
    })
  },

  // The author ticks off each requirement as they address it.
  async setRequirementDone(id: string, requirementId: string, done: boolean, actingUser: ActingUser) {
    const article = await articleRepository.findById(id)
    if (!article) {
      throw new AppError('Article not found.', 404)
    }
    if (article.author.toString() !== actingUser.id) {
      throw new AppError('You do not have permission to modify this article.', 403)
    }
    if (article.status !== ARTICLE_STATUSES.DRAFT) {
      throw new AppError('Requirements can only be updated while the article is a draft.', 400)
    }

    const updated = await articleRepository.setRequirementDone(id, requirementId, done)
    if (!updated) {
      throw new AppError('Requirement not found.', 404)
    }
  },

  async listChangesRequested() {
    return articleRepository.findChangesRequested()
  },

  async deleteArticle(id: string, actingUser: ActingUser) {
    const article = await articleRepository.findById(id)
    if (!article) {
      throw new AppError('Article not found.', 404)
    }
    assertCanManage(article, actingUser)

    await articleRepository.deleteById(id)
  },

  async recordView(id: string, viewerId?: string) {
    const article = await articleRepository.findById(id)
    if (!article || article.status !== ARTICLE_STATUSES.PUBLISHED) {
      throw new AppError('Article not found.', 404)
    }
    await articleRepository.incrementViews(id)

    if (viewerId) {
      await userRepository.recordArticleRead(viewerId, id)
    }
  },

  // Public author-profile page: a reader's liked articles (used in place of
  // "authored articles" for the reader role, since readers don't publish).
  async listLikedByUser(userId: string) {
    return articleRepository.findLikedByUser(userId)
  },
}
