import { AppError } from '../../../shared/errors/AppError.js'
import { ROLES, type Role } from '../../../shared/constants/roles.js'
import { FREE_PLAN_LIMITS } from '../../../shared/constants/plan.js'
import { commentRepository } from '../repositories/comment.repository.js'
import { articleRepository } from '../../articles/repositories/article.repository.js'
import { userRepository } from '../../users/repositories/user.repository.js'
import { notificationService } from '../../notifications/services/notification.service.js'

interface ActingUser {
  id: string
  role: Role
}

export const commentService = {
  // Free-plan commenters get FREE_PLAN_LIMITS.commentsPerMonth comments per
  // month; premium is unlimited.
  async createComment(articleId: string, authorId: string, content: string) {
    const article = await articleRepository.findById(articleId)
    if (!article) {
      throw new AppError('Article not found.', 404)
    }

    const commenter = await userRepository.findById(authorId)
    if (commenter?.plan !== 'premium') {
      await userRepository.resetUsageIfNeeded(authorId)
      const fresh = await userRepository.findById(authorId)
      const used = fresh?.usage?.commentsThisMonth ?? 0
      if (used >= FREE_PLAN_LIMITS.commentsPerMonth) {
        throw new AppError(
          'You have reached your free plan comment limit for this month. Upgrade to premium for unlimited comments.',
          429,
        )
      }
      await userRepository.incrementComments(authorId)
    }

    const comment = await commentRepository.create({ article: articleId, author: authorId, content })

    // Notify the article's owner that someone commented — but not when the
    // owner is commenting on their own article.
    const articleOwnerId = article.author.toString()
    if (articleOwnerId !== authorId) {
      const commenter = await userRepository.findById(authorId)
      await notificationService.notify({
        recipient: articleOwnerId,
        type: 'comment',
        title: 'New comment on your article',
        message: `${commenter?.name ?? 'Someone'} commented on "${article.title}".`,
        priority: 'normal',
        action: 'view',
        actionLabel: 'View comment',
        href: `/article/${article.slug}`,
        relatedId: articleId,
        relatedType: 'article',
        actor: commenter ? { id: authorId, name: commenter.name } : undefined,
      })
    }

    return comment
  },

  async listByArticle(articleId: string) {
    return commentRepository.findByArticle(articleId)
  },

  async listMyComments(userId: string) {
    return commentRepository.findByAuthor(userId)
  },

  // "Comments on my posts": every comment left on any article the acting
  // author/editor/admin owns.
  async listCommentsOnMyArticles(userId: string) {
    const articles = await articleRepository.findByAuthor(userId)
    if (articles.length === 0) return []
    const articleIds = articles.map((article) => article.id as string)
    return commentRepository.findByArticleIds(articleIds)
  },

  async deleteComment(id: string, actingUser: ActingUser) {
    const comment = await commentRepository.findById(id)
    if (!comment) {
      throw new AppError('Comment not found.', 404)
    }
    const isOwner = comment.author.toString() === actingUser.id
    const isPrivileged = actingUser.role === ROLES.ADMIN || actingUser.role === ROLES.EDITOR
    if (!isOwner && !isPrivileged) {
      throw new AppError('You do not have permission to delete this comment.', 403)
    }
    await commentRepository.deleteById(id)
  },

  async toggleLike(id: string, userId: string) {
    const result = await commentRepository.toggleLike(id, userId)
    if (!result) {
      throw new AppError('Comment not found.', 404)
    }
    return result
  },

  async listLikedByUser(userId: string) {
    return commentRepository.findLikedByUser(userId)
  },
}
