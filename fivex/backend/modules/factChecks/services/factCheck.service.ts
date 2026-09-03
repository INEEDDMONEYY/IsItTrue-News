import { AppError } from '../../../shared/errors/AppError.js'
import { ROLES, type Role } from '../../../shared/constants/roles.js'
import { factCheckRepository } from '../repositories/factCheck.repository.js'
import { articleRepository } from '../../articles/repositories/article.repository.js'
import { notificationService } from '../../notifications/services/notification.service.js'
import type { CreateFactCheckRequestInput } from '../validations/factCheck.validation.js'

export const factCheckService = {
  async submitRequest(requestedBy: string, input: CreateFactCheckRequestInput) {
    const article = await articleRepository.findById(input.articleId)
    if (!article) {
      throw new AppError('Article not found.', 404)
    }

    const alreadyPending = await factCheckRepository.hasPendingForArticle(input.articleId)
    if (alreadyPending) {
      throw new AppError('This article already has a fact-check request awaiting review.', 400)
    }

    const factCheck = await factCheckRepository.create({
      article: input.articleId,
      requestedBy,
      claim: input.claim,
      sources: input.sources,
      notes: input.notes,
    })

    await articleRepository.setFactCheckPending(input.articleId)

    return factCheck
  },

  async listMine(requestedBy: string) {
    return factCheckRepository.findByRequester(requestedBy)
  },

  async listPending() {
    return factCheckRepository.findByStatus('pending')
  },

  async listAll() {
    return factCheckRepository.findAll()
  },

  async approve(id: string, actingUser: string) {
    const factCheck = await factCheckRepository.findById(id)
    if (!factCheck) {
      throw new AppError('Fact-check request not found.', 404)
    }

    await factCheckRepository.setApproved(id, actingUser)
    const article = await articleRepository.setFactCheckApproved(factCheck.article.toString(), actingUser)
    if (article) {
      await notificationService.notify({
        recipient: article.author.toString(),
        type: 'fact-check',
        title: 'Fact check approved',
        message: `Your article "${article.title}" passed fact-check review.`,
        priority: 'normal',
        action: 'view',
        actionLabel: 'View article',
        href: `/article/${article.slug}`,
        relatedId: factCheck.article.toString(),
        relatedType: 'article',
      })
    }
  },

  async reject(id: string, actingUser: string, reason: string) {
    const factCheck = await factCheckRepository.findById(id)
    if (!factCheck) {
      throw new AppError('Fact-check request not found.', 404)
    }

    await factCheckRepository.setRejected(id, actingUser, reason)
    const article = await articleRepository.setFactCheckRejected(factCheck.article.toString(), reason, actingUser)
    if (article) {
      await notificationService.notify({
        recipient: article.author.toString(),
        type: 'fact-check',
        title: 'Fact check issues found',
        message: `Your article "${article.title}" had fact-check issues: ${reason}`,
        priority: 'high',
        action: 'review',
        actionLabel: 'Review issues',
        href: `/article/${article.slug}`,
        relatedId: factCheck.article.toString(),
        relatedType: 'article',
      })
    }
  },
}

// Re-exported for clarity at call sites that only need the role list.
export const FACT_CHECK_SUBMITTER_ROLES: Role[] = [ROLES.AUTHOR, ROLES.EDITOR, ROLES.ADMIN]
