import { AppError } from '../../../shared/errors/AppError.js'
import { ROLES, type Role } from '../../../shared/constants/roles.js'
import { slugify } from '../../../utils/slug.js'
import { articleRepository } from '../repositories/article.repository.js'
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
      return article
    }

    const isOwner = actingUser?.id === article.author.toString()
    const isPrivileged =
      actingUser?.role === ROLES.ADMIN || actingUser?.role === ROLES.EDITOR
    if (!isOwner && !isPrivileged) {
      throw new AppError('Article not found.', 404)
    }

    return article
  },

  async getArticleBySlug(slug: string, actingUser?: ActingUser) {
    const article = await articleRepository.findBySlug(slug)
    if (!article) {
      throw new AppError('Article not found.', 404)
    }

    if (article.status === ARTICLE_STATUSES.PUBLISHED) {
      return article
    }

    const isOwner = actingUser?.id === article.author.toString()
    const isPrivileged =
      actingUser?.role === ROLES.ADMIN || actingUser?.role === ROLES.EDITOR
    if (!isOwner && !isPrivileged) {
      throw new AppError('Article not found.', 404)
    }

    return article
  },

  async toggleLike(id: string, userId: string) {
    const result = await articleRepository.toggleLike(id, userId)
    if (!result) {
      throw new AppError('Article not found.', 404)
    }
    return result
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

  async recordView(id: string) {
    const article = await articleRepository.findById(id)
    if (!article || article.status !== ARTICLE_STATUSES.PUBLISHED) {
      throw new AppError('Article not found.', 404)
    }
    await articleRepository.incrementViews(id)
  },
}
