import { AppError } from '../../../shared/errors/AppError.js'
import { ROLES, type Role } from '../../../shared/constants/roles.js'
import { FREE_PLAN_LIMITS } from '../../../shared/constants/plan.js'
import { slugify } from '../../../utils/slug.js'
import { articleRepository } from '../repositories/article.repository.js'
import { userRepository } from '../../users/repositories/user.repository.js'
import { ARTICLE_STATUSES, type ArticleStatus } from '../constants/articleStatus.js'
import type { ArticleDocument } from '../models/Article.js'
import { tagService } from '../../tags/services/tag.service.js'
import { categoryService } from '../../categories/services/category.service.js'

interface ActingUser {
  id: string
  role: Role
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
  if (!viewer || viewer.plan !== 'free') return false


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
    authorId: string,
    input: {
      title: string
      excerpt: string
      body: string
      category: string
      tags?: string[]
      status: Extract<ArticleStatus, 'draft' | 'published'>
      articleImageUrl?: string
      articleVideoUrl?: string
      videoThumbnailUrl?: string
      socialLinks?: string[]
      sourceLinks?: string[]
    },
  ) {
    const slug = `${slugify(input.title) || 'article'}-${Date.now()}`
    const tags = input.tags?.length ? await tagService.normalizeTags(input.tags) : []

    // Articles are posted the moment an author saves them as "published" —
    // there is no separate editorial review gate blocking that from taking
    // effect, regardless of any status an editor might set on it later.
    const publishedAt = input.status === ARTICLE_STATUSES.PUBLISHED ? new Date() : undefined

    return articleRepository.create({ ...input, tags, slug, author: authorId, publishedAt })
  },

  async listOwnArticles(authorId: string) {
    return articleRepository.findByAuthor(authorId)
  },

  async listPendingReview() {
    return articleRepository.findByStatus(ARTICLE_STATUSES.PENDING_REVIEW)
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
      articleImageUrl?: string
      articleVideoUrl?: string
      videoThumbnailUrl?: string
      socialLinks?: string[]
      sourceLinks?: string[]
    },
  ) {
    const article = await articleRepository.findById(id)
    if (!article) {
      throw new AppError('Article not found.', 404)
    }
    assertCanManage(article, actingUser)

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

    // Authors post their own work directly — there is no editorial approval
    // gate blocking an author from publishing (or unpublishing) their own
    // article. Editors/admins can still manage any article's status.
    assertCanManage(article, actingUser)

    await articleRepository.updateStatus(id, status)
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
