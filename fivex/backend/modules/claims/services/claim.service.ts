import { Types, type UpdateQuery } from 'mongoose'
import { AppError } from '../../../shared/errors/AppError.js'
import type { Role } from '../../../shared/constants/roles.js'
import { ARTICLE_STATUSES } from '../../articles/constants/articleStatus.js'
import { articleRepository } from '../../articles/repositories/article.repository.js'
import { userRepository } from '../../users/repositories/user.repository.js'
import { claimRepository } from '../repositories/claim.repository.js'
import { fromLegacyStatus, type AssessmentStatus, type WorkflowStatus } from '../constants/claimStatus.js'
import type { ClaimDocument, IClaim } from '../models/Claim.js'
import type { AddEvidenceInput, CreateClaimInput, UpdateClaimInput } from '../validations/claim.validation.js'
import { claimEventService, snapshotAssessment } from './claimEvent.service.js'

interface Actor {
  id: string
  role: Role
}

const MAX_EVIDENCE_ITEMS = 30
const NARRATIVE_FIELDS = ['conclusion', 'reasoning', 'limitations', 'uncertainty'] as const

function assertValidId(id: string, label: string) {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(`${label} not found.`, 404)
  }
}

// The responsible person is only ever the signed-in account that created or took the claim, or the one an
// admin deliberately assigned. It is never taken from this request, so nobody can be credited for a check they
// didn't do.
function assertResponsible(claim: { assignee?: Types.ObjectId }, actingUserId: string) {
  if (!claim.assignee) {
    throw new AppError('Take responsibility for this claim before changing it.', 403)
  }
  if (claim.assignee.toString() !== actingUserId) {
    throw new AppError('Only the editor responsible for this claim can change it. Take it over first.', 403)
  }
}

// An escalated claim is waiting on an admin, so it is frozen for everyone else until they resolve it.
function assertNotEscalated(claim: { workflowStatus: WorkflowStatus }) {
  if (claim.workflowStatus === 'escalated') {
    throw new AppError('This claim has been escalated and is on hold until an admin resolves it.', 423)
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
      // Returned and escalated claims show as "in review" here, so they count as open too.
      const openClaims = (claimCounts.unreviewed ?? 0) + (claimCounts.in_review ?? 0)
      return { ...article.toJSON(), claimCounts, claimTotal, openClaims }
    })
  },

  async createClaim(actor: Actor, input: CreateClaimInput) {
    assertValidId(input.articleId, 'Article')
    const article = await articleRepository.findById(input.articleId)
    if (!article) throw new AppError('Article not found.', 404)
    if (article.status === ARTICLE_STATUSES.DRAFT) {
      throw new AppError('Claims can only be added to submitted or published articles.', 400)
    }

    const claim = await claimRepository.create({
      article: input.articleId,
      text: input.text,
      createdBy: actor.id,
      assignee: actor.id,
    })

    // A new unreviewed claim means the article is no longer fully fact-checked.
    await articleRepository.clearFactCheckApproval(input.articleId)

    await claimEventService.record({ claim, actor, action: 'created', toWorkflow: 'unreviewed' })
    return claimRepository.findByIdPopulated(claim._id.toString())
  },

  async updateClaim(id: string, actor: Actor, input: UpdateClaimInput) {
    assertValidId(id, 'Claim')
    const claim = await claimRepository.findById(id)
    if (!claim) throw new AppError('Claim not found.', 404)
    assertResponsible(claim, actor.id)
    assertNotEscalated(claim)

    const next = input.status
      ? fromLegacyStatus(input.status)
      : { workflowStatus: claim.workflowStatus, assessmentStatus: claim.assessmentStatus }
    const nextEvidence = input.evidenceStatus ?? claim.evidenceStatus
    if (next.assessmentStatus === 'verified' && nextEvidence !== 'sufficient') {
      throw new AppError('A claim can only be marked Verified once its evidence status is Sufficient.', 400)
    }

    const narrativeInput = NARRATIVE_FIELDS.filter((field) => input[field] !== undefined)
    if (narrativeInput.length > 0 && next.workflowStatus !== 'completed') {
      throw new AppError('Record a conclusion first, such as Verified or Disputed, then add its reasoning.', 400)
    }

    const set: Record<string, unknown> = {}
    const unset: Record<string, 1> = {}
    if (input.text !== undefined) set.text = input.text
    if (input.evidenceStatus !== undefined) set.evidenceStatus = input.evidenceStatus
    if (input.sources !== undefined) set.sources = input.sources
    if (input.evidenceSummary !== undefined) {
      if (input.evidenceSummary) set.evidenceSummary = input.evidenceSummary
      else unset.evidenceSummary = 1
    }

    const workflowChanged = next.workflowStatus !== claim.workflowStatus
    const assessmentChanged = next.assessmentStatus !== claim.assessmentStatus
    const previous = workflowChanged || assessmentChanged || narrativeInput.length > 0 ? await snapshotAssessment(claim) : undefined

    if (workflowChanged || assessmentChanged) {
      set.workflowStatus = next.workflowStatus
      set.assessmentStatus = next.assessmentStatus
      if (claim.workflowStatus === 'returned') unset.returnReason = 1

      if (next.workflowStatus === 'completed') {
        set.reviewedBy = actor.id
        set.reviewedAt = new Date()
        // A new conclusion starts with its own reasoning; the old one lives on in the history.
        const narrative = Object.fromEntries(narrativeInput.map((field) => [field, input[field]]).filter(([, value]) => value))
        if (Object.keys(narrative).length > 0) set.assessment = narrative
        else unset.assessment = 1
      } else {
        unset.reviewedBy = 1
        unset.reviewedAt = 1
        unset.assessment = 1
      }
    } else if (narrativeInput.length > 0) {
      for (const field of narrativeInput) {
        if (input[field]) set[`assessment.${field}`] = input[field]
        else unset[`assessment.${field}`] = 1
      }
    }

    const update: UpdateQuery<IClaim> = {
      ...(Object.keys(set).length > 0 ? { $set: set } : {}),
      ...(Object.keys(unset).length > 0 ? { $unset: unset } : {}),
    }
    const applied = await claimRepository.updateIfUnchanged(
      id,
      { workflowStatus: claim.workflowStatus, assessmentStatus: claim.assessmentStatus },
      update,
    )
    if (!applied) throw new AppError('This claim was just changed by someone else. Reload it and try again.', 409)

    await recordEditorEvents(claim, actor, input, next, previous, narrativeInput.length > 0)

    if (workflowChanged && claim.workflowStatus === 'completed' && next.workflowStatus !== 'completed') {
      await articleRepository.clearFactCheckApproval(claim.article.toString())
    }

    return claimRepository.findByIdPopulated(id)
  },

  async deleteClaim(id: string, actor: Actor) {
    assertValidId(id, 'Claim')
    const claim = await claimRepository.findById(id)
    if (!claim) throw new AppError('Claim not found.', 404)
    assertResponsible(claim, actor.id)
    assertNotEscalated(claim)
    await claimRepository.deleteById(id)
    await claimEventService.record({ claim, actor, action: 'deleted', fromWorkflow: claim.workflowStatus })
  },

  // The only way a reviewer becomes responsible for a claim by their own hand: the acting account takes it
  // for itself. (An admin can also assign someone, which is recorded as theirs, not the assignee's.)
  async takeResponsibility(id: string, actor: Actor) {
    assertValidId(id, 'Claim')
    const claim = await claimRepository.findById(id)
    if (!claim) throw new AppError('Claim not found.', 404)
    assertNotEscalated(claim)

    if (claim.assignee?.toString() !== actor.id) {
      const previous = claim.assignee ? await namedPerson(claim.assignee.toString()) : null
      await claimRepository.update(id, { $set: { assignee: actor.id } })
      await claimEventService.record({
        claim,
        actor,
        action: previous ? 'reassigned' : 'assigned',
        fromAssignee: previous,
        toAssignee: await namedPerson(actor.id),
        note: 'Took responsibility',
      })
    }
    return claimRepository.findByIdPopulated(id)
  },

  async addEvidence(id: string, actor: Actor, input: AddEvidenceInput) {
    assertValidId(id, 'Claim')
    const claim = await claimRepository.findById(id)
    if (!claim) throw new AppError('Claim not found.', 404)
    assertResponsible(claim, actor.id)
    assertNotEscalated(claim)
    if (claim.evidence.length >= MAX_EVIDENCE_ITEMS) {
      throw new AppError(`A claim can hold at most ${MAX_EVIDENCE_ITEMS} evidence items.`, 400)
    }

    await claimRepository.update(id, {
      $push: { evidence: { ...input, restricted: false, addedBy: actor.id, addedAt: new Date() } },
    })
    await claimEventService.record({ claim, actor, action: 'evidence_added', note: `${input.stance}: ${input.title}` })
    return claimRepository.findByIdPopulated(id)
  },

  async removeEvidence(id: string, itemId: string, actor: Actor) {
    assertValidId(id, 'Claim')
    assertValidId(itemId, 'Evidence')
    const claim = await claimRepository.findById(id)
    if (!claim) throw new AppError('Claim not found.', 404)
    assertResponsible(claim, actor.id)
    assertNotEscalated(claim)

    const item = claim.evidence.find((entry) => entry._id.toString() === itemId)
    if (!item) throw new AppError('Evidence not found.', 404)
    if (item.restricted) {
      throw new AppError('An admin restricted this evidence, so only an admin can remove it.', 403)
    }

    await claimRepository.update(id, { $pull: { evidence: { _id: itemId } } })
    await claimEventService.record({ claim, actor, action: 'evidence_removed', note: `${item.stance}: ${item.title}` })
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

async function namedPerson(userId: string) {
  const user = await userRepository.findById(userId)
  return { id: userId, name: user?.name ?? 'Unknown user' }
}

async function recordEditorEvents(
  claim: ClaimDocument,
  actor: Actor,
  input: UpdateClaimInput,
  next: { workflowStatus: WorkflowStatus; assessmentStatus: AssessmentStatus },
  previous: Awaited<ReturnType<typeof snapshotAssessment>>,
  narrativeChanged: boolean,
) {
  const base = { claim, actor }
  const workflowChanged = next.workflowStatus !== claim.workflowStatus
  const assessmentChanged = next.assessmentStatus !== claim.assessmentStatus

  if (workflowChanged || assessmentChanged) {
    const wasConcluded = claim.workflowStatus === 'completed'
    const isConcluded = next.workflowStatus === 'completed'
    await claimEventService.record({
      ...base,
      action: isConcluded ? (wasConcluded ? 'assessment_revised' : 'assessment_recorded') : 'workflow_changed',
      fromWorkflow: claim.workflowStatus,
      toWorkflow: next.workflowStatus,
      fromAssessment: claim.assessmentStatus,
      toAssessment: next.assessmentStatus,
      // Whatever conclusion this replaces or clears is kept in the history.
      ...(previous ? { previousAssessment: previous } : {}),
    })
  } else if (narrativeChanged) {
    await claimEventService.record({
      ...base,
      action: 'assessment_revised',
      fromAssessment: claim.assessmentStatus,
      toAssessment: next.assessmentStatus,
      changedFields: NARRATIVE_FIELDS.filter((field) => input[field] !== undefined),
      ...(previous ? { previousAssessment: previous } : {}),
    })
  }

  const evidenceFields = (['evidenceStatus', 'evidenceSummary', 'sources'] as const).filter((field) => input[field] !== undefined)
  if (evidenceFields.length > 0) {
    await claimEventService.record({ ...base, action: 'evidence_updated', changedFields: [...evidenceFields] })
  }
  if (input.text !== undefined && input.text !== claim.text) {
    await claimEventService.record({ ...base, action: 'metadata_corrected', changedFields: ['text'] })
  }
}
