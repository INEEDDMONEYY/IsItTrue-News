import { Types } from 'mongoose'
import { AppError } from '../../../shared/errors/AppError.js'
import { ARTICLE_STATUSES } from '../../articles/constants/articleStatus.js'
import { articleRepository } from '../../articles/repositories/article.repository.js'
import { claimRepository, type ClaimChanges } from '../repositories/claim.repository.js'
import { CLAIM_STATUSES, isOpenClaimStatus, type ClaimStatus } from '../constants/claimStatus.js'
import type { CreateClaimInput, UpdateClaimInput } from '../validations/claim.validation.js'

function assertValidId(id: string, label: string) {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(`${label} not found.`, 404)
  }
}

// The responsible person is only ever the signed-in account that created or took the claim —
// it is never taken from the request — so nobody can be credited for a check they didn't do.
function assertResponsible(claim: { assignee?: Types.ObjectId }, actingUserId: string) {
  if (!claim.assignee) {
    throw new AppError('Take responsibility for this claim before changing it.', 403)
  }
  if (claim.assignee.toString() !== actingUserId) {
    throw new AppError('Only the editor responsible for this claim can change it. Take it over first.', 403)
  }
}

export const claimService = {
  async listClaims() {
    return claimRepository.findAll()
  },

  // Every article an editor can fact-check, with its claim tallies and fact-check state.
  async listArticles() {
    const articles = await articleRepository.findForFactCheckOversight()
    const counts = await claimRepository.countsByArticle(articles.map((article) => article._id.toString()))

    return articles.map((article) => {
      const claimCounts = counts.get(article._id.toString()) ?? {}
      const claimTotal = Object.values(claimCounts).reduce((sum, count) => sum + (count ?? 0), 0)
      const openClaims = CLAIM_STATUSES.filter(isOpenClaimStatus).reduce(
        (sum, status) => sum + (claimCounts[status] ?? 0),
        0,
      )
      return { ...article.toJSON(), claimCounts, claimTotal, openClaims }
    })
  },

  async createClaim(actingUserId: string, input: CreateClaimInput) {
    assertValidId(input.articleId, 'Article')
    const article = await articleRepository.findById(input.articleId)
    if (!article) throw new AppError('Article not found.', 404)
    if (article.status === ARTICLE_STATUSES.DRAFT) {
      throw new AppError('Claims can only be added to submitted or published articles.', 400)
    }

    const claim = await claimRepository.create({
      article: input.articleId,
      text: input.text,
      createdBy: actingUserId,
      assignee: actingUserId,
    })

    // A new unreviewed claim means the article is no longer fully fact-checked.
    await articleRepository.clearFactCheckApproval(input.articleId)

    return claimRepository.findByIdPopulated(claim._id.toString())
  },

  async updateClaim(id: string, actingUserId: string, input: UpdateClaimInput) {
    assertValidId(id, 'Claim')
    const claim = await claimRepository.findById(id)
    if (!claim) throw new AppError('Claim not found.', 404)
    assertResponsible(claim, actingUserId)

    const nextStatus: ClaimStatus = input.status ?? claim.status
    const nextEvidence = input.evidenceStatus ?? claim.evidenceStatus
    if (nextStatus === 'verified' && nextEvidence !== 'sufficient') {
      throw new AppError('A claim can only be marked Verified once its evidence status is Sufficient.', 400)
    }

    const changes: ClaimChanges = { set: {}, unset: [] }
    if (input.text !== undefined) changes.set.text = input.text
    if (input.evidenceStatus !== undefined) changes.set.evidenceStatus = input.evidenceStatus
    if (input.sources !== undefined) changes.set.sources = input.sources
    if (input.evidenceSummary !== undefined) {
      if (input.evidenceSummary) changes.set.evidenceSummary = input.evidenceSummary
      else changes.unset.push('evidenceSummary')
    }

    const statusChanged = nextStatus !== claim.status
    if (statusChanged) {
      changes.set.status = nextStatus
      if (isOpenClaimStatus(nextStatus)) {
        changes.unset.push('reviewedBy', 'reviewedAt')
      } else {
        changes.set.reviewedBy = actingUserId
        changes.set.reviewedAt = new Date()
      }
    }

    await claimRepository.update(id, changes)

    if (statusChanged && isOpenClaimStatus(nextStatus) && !isOpenClaimStatus(claim.status)) {
      await articleRepository.clearFactCheckApproval(claim.article.toString())
    }

    return claimRepository.findByIdPopulated(id)
  },

  async deleteClaim(id: string, actingUserId: string) {
    assertValidId(id, 'Claim')
    const claim = await claimRepository.findById(id)
    if (!claim) throw new AppError('Claim not found.', 404)
    assertResponsible(claim, actingUserId)
    await claimRepository.deleteById(id)
  },

  // The only way responsibility changes hands: the acting account takes it for itself.
  async takeResponsibility(id: string, actingUserId: string) {
    assertValidId(id, 'Claim')
    const claim = await claimRepository.findById(id)
    if (!claim) throw new AppError('Claim not found.', 404)
    if (claim.assignee?.toString() !== actingUserId) {
      await claimRepository.update(id, { set: { assignee: actingUserId }, unset: [] })
    }
    return claimRepository.findByIdPopulated(id)
  },

  // The editor's call on whether an article counts as fact-checked.
  async setArticleFactChecked(articleId: string, actingUserId: string, factChecked: boolean) {
    assertValidId(articleId, 'Article')
    const article = await articleRepository.findById(articleId)
    if (!article) throw new AppError('Article not found.', 404)
    if (article.status === ARTICLE_STATUSES.DRAFT) {
      throw new AppError('Only submitted or published articles can be fact-checked.', 400)
    }

    if (!factChecked) {
      await articleRepository.clearFactCheckApproval(articleId)
      return
    }

    if (article.factCheckStatus === 'rejected') {
      throw new AppError(
        'An admin flagged this article during fact-check verification. Resolve that review first.',
        400,
      )
    }

    const { total, open } = await claimRepository.countForArticle(articleId)
    if (total === 0) {
      throw new AppError('Add and review at least one claim before marking this article as fact-checked.', 400)
    }
    if (open > 0) {
      throw new AppError(
        `${open} ${open === 1 ? 'claim is' : 'claims are'} still unreviewed or in review.`,
        400,
      )
    }

    await articleRepository.setFactCheckVerified(articleId, actingUserId)
  },
}
