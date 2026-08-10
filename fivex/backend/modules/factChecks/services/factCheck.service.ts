import { AppError } from '../../../shared/errors/AppError.js'
import { ROLES, type Role } from '../../../shared/constants/roles.js'
import { factCheckRepository } from '../repositories/factCheck.repository.js'
import { articleRepository } from '../../articles/repositories/article.repository.js'
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
    await articleRepository.setFactCheckApproved(factCheck.article.toString())
  },

  async reject(id: string, actingUser: string, reason: string) {
    const factCheck = await factCheckRepository.findById(id)
    if (!factCheck) {
      throw new AppError('Fact-check request not found.', 404)
    }

    await factCheckRepository.setRejected(id, actingUser, reason)
    await articleRepository.setFactCheckRejected(factCheck.article.toString(), reason)
  },
}

// Re-exported for clarity at call sites that only need the role list.
export const FACT_CHECK_SUBMITTER_ROLES: Role[] = [ROLES.AUTHOR, ROLES.EDITOR, ROLES.ADMIN]
