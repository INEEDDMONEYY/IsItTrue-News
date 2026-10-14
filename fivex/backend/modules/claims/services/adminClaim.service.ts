import { Types } from 'mongoose'
import { AppError } from '../../../shared/errors/AppError.js'
import { ROLES, type Role } from '../../../shared/constants/roles.js'
import { articleRepository } from '../../articles/repositories/article.repository.js'
import { notificationService } from '../../notifications/services/notification.service.js'
import { userRepository } from '../../users/repositories/user.repository.js'
import { logger } from '../../../config/logger.js'
import { escapeRegex } from '../../../utils/escapeRegex.js'
import {
  FACT_CHECK_VIEWS,
  deriveEvidenceState,
  isOpenWorkflow,
  type EscalationKind,
  type FactCheckView,
} from '../constants/claimStatus.js'
import type { ClaimDocument } from '../models/Claim.js'
import type { ClaimEventDocument } from '../models/ClaimEvent.js'
import { adminClaimRepository, type ClaimListRow } from '../repositories/adminClaim.repository.js'
import { claimRepository } from '../repositories/claim.repository.js'
import type {
  AdminClaimListQuery,
  AssignInput,
  ClearFlagInput,
  CommentInput,
  EscalateInput,
  FlagEvidenceInput,
  InvestigationLinkInput,
  MetadataInput,
  ResolveEscalationInput,
  RestrictionInput,
  ReturnInput,
  RevisionInput,
  UnassignInput,
} from '../validations/adminClaim.validation.js'
import { claimEventService, snapshotAssessment, type PersonRef } from './claimEvent.service.js'

interface Admin {
  id: string
  role: Role
}

const ESCALATION_LABELS: Record<EscalationKind, string> = {
  conflict_of_interest: 'Conflict of interest',
  policy_violation: 'Policy violation',
  other: 'Escalated',
}

const NARRATIVE_FIELDS = ['conclusion', 'reasoning', 'limitations', 'uncertainty'] as const

type Populated = { _id: Types.ObjectId; name?: string; role?: string } | Types.ObjectId | null | undefined

// A populated reference, an unpopulated id, or null when the person no longer exists.
function toPerson(value: Populated): PersonRef | null {
  if (!value || value instanceof Types.ObjectId) return null
  return value._id && value.name ? { id: value._id.toString(), name: value.name } : null
}

const iso = (date: Date | undefined | null) => (date ? date.toISOString() : null)

// Deadlines are whole calendar days. A claim due "Mar 31" is not overdue until that day has ended (UTC).
const endOfDay = (date: string) => new Date(`${date}T23:59:59.999Z`)

const isOverdue = (workflowStatus: ClaimDocument['workflowStatus'], dueAt: Date | undefined, now: Date) =>
  isOpenWorkflow(workflowStatus) && Boolean(dueAt) && (dueAt as Date).getTime() < now.getTime()

function toRow(row: ClaimListRow, now: Date) {
  return {
    id: row._id.toString(),
    claim: row.text,
    article: row.articleDoc
      ? { id: row.articleDoc._id.toString(), title: row.articleDoc.title, slug: row.articleDoc.slug, status: row.articleDoc.status }
      : null,
    assignee: row.assigneeDoc ? { id: row.assigneeDoc._id.toString(), name: row.assigneeDoc.name } : null,
    evidence: {
      state: deriveEvidenceState({
        itemCount: row.evidenceItemCount,
        sourceCount: row.sourceCount,
        evidenceStatus: row.evidenceStatus,
        flagged: row.flagged,
      }),
      status: row.evidenceStatus,
      itemCount: row.evidenceItemCount,
      sourceCount: row.sourceCount,
      flagged: row.flagged,
    },
    workflowStatus: row.workflowStatus,
    assessmentStatus: row.assessmentStatus,
    priority: row.priority,
    dueAt: iso(row.dueAt),
    overdue: isOverdue(row.workflowStatus, row.dueAt, now),
    escalated: row.workflowStatus === 'escalated',
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

async function toDetail(claim: ClaimDocument, now: Date) {
  const article = claim.article as unknown as
    | { _id: Types.ObjectId; title: string; slug: string; status: string; category: string; factCheckStatus: string; publishedAt?: Date }
    | Types.ObjectId
    | null
  const articleDoc = article && !(article instanceof Types.ObjectId) ? article : null
  const articleId = articleDoc ? articleDoc._id.toString() : claim.article.toString()

  const assigneeRef = claim.assignee as unknown as Populated
  const assignee = toPerson(assigneeRef)
  const investigationRef = claim.investigation as unknown as
    | { _id: Types.ObjectId; title: string; slug: string; status: string }
    | Types.ObjectId
    | undefined
  const investigation = investigationRef && !(investigationRef instanceof Types.ObjectId) ? investigationRef : null

  const corrections = await adminClaimRepository.correctionsForArticle(articleId)
  const flagged = Boolean(claim.evidenceFlag)
  const evidenceState = deriveEvidenceState({
    itemCount: claim.evidence.length,
    sourceCount: claim.sources.length,
    evidenceStatus: claim.evidenceStatus,
    flagged,
  })
  const escalation = claim.escalation
  const flag = claim.evidenceFlag

  return {
    id: claim._id.toString(),
    updatedAt: claim.updatedAt.toISOString(),
    createdAt: claim.createdAt.toISOString(),

    // 1. The claim itself.
    claim: {
      text: claim.text,
      context: claim.context ?? null,
      checkReason: claim.checkReason ?? null,
      createdBy: toPerson(claim.createdBy as unknown as Populated),
    },

    // The verification task: who is responsible and where the work stands.
    task: {
      workflowStatus: claim.workflowStatus,
      assignee: assignee ? { ...assignee, role: (assigneeRef as { role?: string }).role ?? null } : null,
      priority: claim.priority,
      dueAt: iso(claim.dueAt),
      overdue: isOverdue(claim.workflowStatus, claim.dueAt, now),
      returnReason: claim.returnReason ?? null,
      escalation: escalation
        ? {
            kind: escalation.kind,
            reason: escalation.reason,
            by: toPerson(escalation.escalatedBy as unknown as Populated),
            at: escalation.escalatedAt.toISOString(),
          }
        : null,
    },

    // 2. Evidence and sources.
    evidence: {
      state: evidenceState,
      status: claim.evidenceStatus,
      summary: claim.evidenceSummary ?? null,
      sources: claim.sources,
      flag: flag
        ? { reason: flag.reason, by: toPerson(flag.flaggedBy as unknown as Populated), at: flag.flaggedAt.toISOString() }
        : null,
      items: claim.evidence.map((item) => ({
        id: item._id.toString(),
        stance: item.stance,
        title: item.title,
        url: item.url ?? null,
        citation: item.citation ?? null,
        reliability: item.reliability,
        reliabilityNote: item.reliabilityNote ?? null,
        restricted: item.restricted,
        restrictedBy: toPerson(item.restrictedBy as unknown as Populated),
        restrictedAt: iso(item.restrictedAt),
        addedBy: toPerson(item.addedBy as unknown as Populated),
        addedAt: item.addedAt.toISOString(),
      })),
    },

    // 4. The final assessment, or null while there is no conclusion.
    assessment:
      claim.assessmentStatus === 'none'
        ? null
        : {
            status: claim.assessmentStatus,
            conclusion: claim.assessment?.conclusion ?? null,
            reasoning: claim.assessment?.reasoning ?? null,
            limitations: claim.assessment?.limitations ?? null,
            uncertainty: claim.assessment?.uncertainty ?? null,
            decidedBy: toPerson(claim.reviewedBy as unknown as Populated),
            decidedAt: iso(claim.reviewedAt),
          },

    // 5. Where this shows up for readers, and what else it touches.
    connections: {
      article: articleDoc
        ? {
            id: articleId,
            title: articleDoc.title,
            slug: articleDoc.slug,
            status: articleDoc.status,
            category: articleDoc.category,
            factCheckStatus: articleDoc.factCheckStatus,
            // Only a published article has a page readers can open.
            publicUrl: articleDoc.status === 'published' ? `/article/${articleDoc.slug}` : null,
          }
        : null,
      corrections: corrections.map((correction) => ({
        id: correction._id.toString(),
        status: correction.status,
        category: correction.category,
        summary: correction.description.slice(0, 200),
        number: correction.publication?.number ?? null,
        createdAt: correction.createdAt.toISOString(),
      })),
      investigation: investigation
        ? { id: investigation._id.toString(), title: investigation.title, slug: investigation.slug, status: investigation.status }
        : null,
    },

    // What an admin may do right now, decided here so the page can only offer valid moves.
    actions: {
      unassign: Boolean(assignee),
      returnForReview: ['in_review', 'completed', 'escalated'].includes(claim.workflowStatus),
      escalate: claim.workflowStatus !== 'escalated',
      resolveEscalation: claim.workflowStatus === 'escalated',
      flagEvidence: !flagged,
      clearEvidenceFlag: flagged,
      reviseAssessment: claim.workflowStatus === 'completed',
    },
  }
}

function toEvent(entry: ClaimEventDocument) {
  const previous = entry.previousAssessment
  return {
    id: entry._id.toString(),
    action: entry.action,
    actor: { id: entry.actor.toString(), name: entry.actorName, role: entry.actorRole },
    note: entry.note ?? null,
    fromWorkflow: entry.fromWorkflow ?? null,
    toWorkflow: entry.toWorkflow ?? null,
    fromAssessment: entry.fromAssessment ?? null,
    toAssessment: entry.toAssessment ?? null,
    fromAssignee: entry.fromAssignee ? { id: entry.fromAssignee.id.toString(), name: entry.fromAssignee.name } : null,
    toAssignee: entry.toAssignee ? { id: entry.toAssignee.id.toString(), name: entry.toAssignee.name } : null,
    previousAssessment: previous
      ? {
          status: previous.assessmentStatus,
          conclusion: previous.conclusion ?? null,
          reasoning: previous.reasoning ?? null,
          limitations: previous.limitations ?? null,
          uncertainty: previous.uncertainty ?? null,
          decidedByName: previous.decidedByName ?? null,
          decidedAt: iso(previous.decidedAt),
        }
      : null,
    changedFields: entry.changedFields ?? [],
    createdAt: entry.createdAt.toISOString(),
  }
}

// Telling people is a side effect: a failure to notify must never fail the action itself.
async function notifyReviewer(
  recipientId: string | undefined,
  admin: Admin,
  claim: ClaimDocument,
  message: { title: string; message: string; priority?: 'normal' | 'high' },
) {
  if (!recipientId || recipientId === admin.id) return
  try {
    const adminUser = await userRepository.findById(admin.id)
    await notificationService.notify({
      recipient: recipientId,
      type: 'editorial',
      title: message.title,
      message: `${message.message} Claim: "${claim.text}"`.slice(0, 500),
      priority: message.priority ?? 'normal',
      action: 'review',
      actionLabel: 'Open fact-check oversight',
      href: '/dashboard/fact-check-oversight',
      relatedId: claim._id.toString(),
      relatedType: 'claim',
      ...(adminUser ? { actor: { id: admin.id, name: adminUser.name } } : {}),
    })
  } catch (error) {
    logger.error('Failed to notify a reviewer about a fact-check change.', error)
  }
}

async function loadClaim(id: string): Promise<ClaimDocument> {
  const claim = await adminClaimRepository.findRaw(id)
  if (!claim) throw new AppError('Fact-check record not found.', 404)
  return claim
}

async function namedPerson(userId: string): Promise<PersonRef> {
  const user = await userRepository.findById(userId)
  return { id: userId, name: user?.name ?? 'Unknown user' }
}

const CONFLICT = 'This record was just changed by someone else. Reload it and try again.'

export const adminClaimService = {
  // One count per preset list, from the same definitions the lists use, so a card's number equals its list.
  async overview() {
    const now = new Date()
    const entries = await Promise.all(
      FACT_CHECK_VIEWS.map(async (view) => [view, await adminClaimRepository.count(view, now)] as const),
    )
    return { counts: Object.fromEntries(entries) as Record<FactCheckView, number>, generatedAt: now.toISOString() }
  },

  async list(query: AdminClaimListQuery) {
    const now = new Date()
    const escapedSearch = query.q ? escapeRegex(query.q) : undefined
    const { rows, total } = await adminClaimRepository.search(query, escapedSearch, now)
    return {
      records: rows.map((row) => toRow(row, now)),
      total,
      page: query.page,
      pageSize: query.pageSize,
      totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
      view: query.view,
    }
  },

  async reviewers() {
    const users = await userRepository.findByRoles([ROLES.EDITOR, ROLES.ADMIN])
    return users.map((user) => ({ id: user._id.toString(), name: user.name, role: user.role }))
  },

  async investigations(q: string | undefined) {
    const found = await adminClaimRepository.searchInvestigations(q ? escapeRegex(q) : undefined)
    return found.map((entry) => ({ id: entry._id.toString(), title: entry.title, status: entry.status }))
  },

  async getDetail(id: string) {
    const claim = await adminClaimRepository.findDetail(id)
    if (!claim) throw new AppError('Fact-check record not found.', 404)
    return toDetail(claim, new Date())
  },

  // Works for deleted records too: the history is kept after the record itself is gone.
  async getHistory(id: string) {
    const { entries, total } = await claimEventService.listForClaim(id)
    return { entries: entries.map(toEvent), total }
  },

  async assign(id: string, admin: Admin, input: AssignInput) {
    const claim = await loadClaim(id)
    const reviewer = await userRepository.findById(input.reviewerId)
    if (!reviewer || (reviewer.role !== ROLES.EDITOR && reviewer.role !== ROLES.ADMIN)) {
      throw new AppError('Only an editor or admin can be made responsible for a fact-check.', 400)
    }
    if (claim.assignee?.toString() === input.reviewerId) {
      throw new AppError(`${reviewer.name} is already responsible for this claim.`, 409)
    }

    const previous = claim.assignee ? await namedPerson(claim.assignee.toString()) : null
    await claimRepository.update(id, { $set: { assignee: input.reviewerId } })

    // The assignment is the admin's act and is recorded as theirs. It changes who is responsible from now on,
    // never who gets credit for a conclusion already recorded.
    await claimEventService.record({
      claim,
      actor: admin,
      action: previous ? 'reassigned' : 'assigned',
      fromAssignee: previous,
      toAssignee: { id: input.reviewerId, name: reviewer.name },
      note: input.note,
    })
    await notifyReviewer(input.reviewerId, admin, claim, {
      title: 'A fact-check was assigned to you',
      message: 'An admin made you responsible for this claim.',
      priority: 'high',
    })
    if (previous && previous.id !== input.reviewerId) {
      await notifyReviewer(previous.id, admin, claim, {
        title: 'A fact-check was reassigned',
        message: `An admin reassigned this claim to ${reviewer.name}.`,
      })
    }
    return this.getDetail(id)
  },

  async unassign(id: string, admin: Admin, input: UnassignInput) {
    const claim = await loadClaim(id)
    if (!claim.assignee) throw new AppError('Nobody is responsible for this claim.', 409)

    const previous = await namedPerson(claim.assignee.toString())
    // Nobody is working an unowned claim, so a mid-review one goes back to the queue.
    const backToQueue = claim.workflowStatus === 'in_review'
    const applied = await claimRepository.updateIfUnchanged(
      id,
      { workflowStatus: claim.workflowStatus, assessmentStatus: claim.assessmentStatus },
      { $unset: { assignee: 1 }, ...(backToQueue ? { $set: { workflowStatus: 'unreviewed' } } : {}) },
    )
    if (!applied) throw new AppError(CONFLICT, 409)

    await claimEventService.record({
      claim,
      actor: admin,
      action: 'unassigned',
      fromAssignee: previous,
      note: input.reason,
      ...(backToQueue ? { fromWorkflow: 'in_review', toWorkflow: 'unreviewed' } : {}),
    })
    await notifyReviewer(previous.id, admin, claim, {
      title: 'You are no longer responsible for a fact-check',
      message: `An admin took this claim off you. Reason: ${input.reason}`,
    })
    return this.getDetail(id)
  },

  // Sends a record back for another look. Any conclusion it held is kept in the history, not discarded.
  async returnForReview(id: string, admin: Admin, input: ReturnInput) {
    const claim = await loadClaim(id)
    if (!['in_review', 'completed', 'escalated'].includes(claim.workflowStatus)) {
      throw new AppError('Only a record that is being reviewed, finished or escalated can be returned.', 409)
    }

    const previous = await snapshotAssessment(claim)
    const applied = await claimRepository.updateIfUnchanged(
      id,
      { workflowStatus: claim.workflowStatus, assessmentStatus: claim.assessmentStatus },
      {
        $set: { workflowStatus: 'returned', assessmentStatus: 'none', returnReason: input.reason },
        $unset: { assessment: 1, reviewedBy: 1, reviewedAt: 1, escalation: 1 },
      },
    )
    if (!applied) throw new AppError(CONFLICT, 409)

    await claimEventService.record({
      claim,
      actor: admin,
      action: 'returned',
      fromWorkflow: claim.workflowStatus,
      toWorkflow: 'returned',
      fromAssessment: claim.assessmentStatus,
      toAssessment: 'none',
      note: input.reason,
      ...(previous ? { previousAssessment: previous } : {}),
    })
    if (claim.workflowStatus === 'completed') await articleRepository.clearFactCheckApproval(claim.article.toString())
    await notifyReviewer(claim.assignee?.toString(), admin, claim, {
      title: 'A fact-check was returned for further review',
      message: `An admin returned this claim. Reason: ${input.reason}`,
      priority: 'high',
    })
    return this.getDetail(id)
  },

  // Flags a conflict of interest or policy problem and freezes the record until an admin resolves it. The
  // reviewer is deliberately not told, because the concern may be about them.
  async escalate(id: string, admin: Admin, input: EscalateInput) {
    const claim = await loadClaim(id)
    if (claim.workflowStatus === 'escalated') throw new AppError('This record is already escalated.', 409)

    const previous = await snapshotAssessment(claim)
    const applied = await claimRepository.updateIfUnchanged(
      id,
      { workflowStatus: claim.workflowStatus, assessmentStatus: claim.assessmentStatus },
      {
        $set: {
          workflowStatus: 'escalated',
          assessmentStatus: 'none',
          escalation: { kind: input.kind, reason: input.reason, escalatedBy: admin.id, escalatedAt: new Date() },
        },
        $unset: { assessment: 1, reviewedBy: 1, reviewedAt: 1, returnReason: 1 },
      },
    )
    if (!applied) throw new AppError(CONFLICT, 409)

    await claimEventService.record({
      claim,
      actor: admin,
      action: 'escalated',
      fromWorkflow: claim.workflowStatus,
      toWorkflow: 'escalated',
      fromAssessment: claim.assessmentStatus,
      toAssessment: 'none',
      note: `${ESCALATION_LABELS[input.kind]}: ${input.reason}`,
      ...(previous ? { previousAssessment: previous } : {}),
    })
    if (claim.workflowStatus === 'completed') await articleRepository.clearFactCheckApproval(claim.article.toString())
    return this.getDetail(id)
  },

  async resolveEscalation(id: string, admin: Admin, input: ResolveEscalationInput) {
    const claim = await loadClaim(id)
    if (claim.workflowStatus !== 'escalated') throw new AppError('This record is not escalated.', 409)

    const next = claim.assignee ? 'in_review' : 'unreviewed'
    const applied = await claimRepository.updateIfUnchanged(
      id,
      { workflowStatus: 'escalated', assessmentStatus: claim.assessmentStatus },
      { $set: { workflowStatus: next }, $unset: { escalation: 1 } },
    )
    if (!applied) throw new AppError(CONFLICT, 409)

    await claimEventService.record({
      claim,
      actor: admin,
      action: 'escalation_resolved',
      fromWorkflow: 'escalated',
      toWorkflow: next,
      note: input.note,
    })
    await notifyReviewer(claim.assignee?.toString(), admin, claim, {
      title: 'A fact-check is back with you',
      message: 'An admin resolved the hold on this claim.',
    })
    return this.getDetail(id)
  },

  async flagEvidence(id: string, admin: Admin, input: FlagEvidenceInput) {
    const claim = await loadClaim(id)
    if (claim.evidenceFlag) throw new AppError('The evidence is already flagged.', 409)

    await claimRepository.update(id, {
      $set: { evidenceFlag: { reason: input.reason, flaggedBy: admin.id, flaggedAt: new Date() } },
    })
    await claimEventService.record({ claim, actor: admin, action: 'evidence_flagged', note: input.reason })
    await notifyReviewer(claim.assignee?.toString(), admin, claim, {
      title: 'Evidence was flagged as incomplete',
      message: `An admin says: ${input.reason}`,
      priority: 'high',
    })
    return this.getDetail(id)
  },

  async clearEvidenceFlag(id: string, admin: Admin, input: ClearFlagInput) {
    const claim = await loadClaim(id)
    if (!claim.evidenceFlag) throw new AppError('The evidence is not flagged.', 409)

    await claimRepository.update(id, { $unset: { evidenceFlag: 1 } })
    await claimEventService.record({ claim, actor: admin, action: 'evidence_flag_cleared', note: input.note })
    return this.getDetail(id)
  },

  async setEvidenceRestriction(id: string, itemId: string, admin: Admin, input: RestrictionInput) {
    const claim = await loadClaim(id)
    const item = claim.evidence.find((entry) => entry._id.toString() === itemId)
    if (!item) throw new AppError('Evidence not found.', 404)
    if (item.restricted === input.restricted) {
      throw new AppError(input.restricted ? 'This evidence is already restricted.' : 'This evidence is not restricted.', 409)
    }

    await claimRepository.update(
      id,
      input.restricted
        ? { $set: { 'evidence.$[item].restricted': true, 'evidence.$[item].restrictedBy': admin.id, 'evidence.$[item].restrictedAt': new Date() } }
        : { $set: { 'evidence.$[item].restricted': false }, $unset: { 'evidence.$[item].restrictedBy': 1, 'evidence.$[item].restrictedAt': 1 } },
      [{ 'item._id': new Types.ObjectId(itemId) }],
    )
    await claimEventService.record({
      claim,
      actor: admin,
      action: input.restricted ? 'evidence_restricted' : 'evidence_unrestricted',
      note: `${item.title}: ${input.reason}`,
    })
    return this.getDetail(id)
  },

  // The one action that can change a fact-checker's conclusion. It is never silent: it needs a reason, and the
  // conclusion it replaces is stored in full in the history.
  async reviseAssessment(id: string, admin: Admin, input: RevisionInput) {
    const claim = await loadClaim(id)
    if (claim.workflowStatus !== 'completed' || claim.assessmentStatus === 'none') {
      throw new AppError(
        'Only a record that already has a conclusion can be revised. For an open one, assign it or return it instead.',
        409,
      )
    }
    const nextStatus = input.assessmentStatus as ClaimDocument['assessmentStatus']
    if (nextStatus === 'verified' && claim.evidenceStatus !== 'sufficient') {
      throw new AppError('A claim can only be Verified once its evidence status is Sufficient.', 400)
    }

    const narrative: Record<string, string | undefined> = {}
    for (const field of NARRATIVE_FIELDS) {
      const current = claim.assessment?.[field]
      if (current) narrative[field] = current
    }
    const changedFields: string[] = []
    for (const field of NARRATIVE_FIELDS) {
      const value = input[field]
      if (value !== undefined && (value || undefined) !== narrative[field]) {
        changedFields.push(field)
        if (value) narrative[field] = value
        else delete narrative[field]
      }
    }
    if (nextStatus === claim.assessmentStatus && changedFields.length === 0) {
      throw new AppError('Nothing changed. Edit the conclusion or its reasoning first.', 400)
    }

    const previous = await snapshotAssessment(claim)
    const applied = await claimRepository.updateIfUnchanged(
      id,
      { workflowStatus: 'completed', assessmentStatus: claim.assessmentStatus },
      {
        $set: { assessmentStatus: nextStatus, reviewedBy: admin.id, reviewedAt: new Date(), ...(Object.keys(narrative).length ? { assessment: narrative } : {}) },
        ...(Object.keys(narrative).length ? {} : { $unset: { assessment: 1 } }),
      },
    )
    if (!applied) throw new AppError(CONFLICT, 409)

    await claimEventService.record({
      claim,
      actor: admin,
      action: 'assessment_revised',
      fromAssessment: claim.assessmentStatus,
      toAssessment: nextStatus,
      note: input.reason,
      changedFields,
      ...(previous ? { previousAssessment: previous } : {}),
    })
    // The editor's "fact-checked" mark was a judgement on the old conclusions, so it has to be re-confirmed.
    await articleRepository.clearFactCheckApproval(claim.article.toString())
    await notifyReviewer(previous?.decidedBy?.toString(), admin, claim, {
      title: 'Your fact-check conclusion was revised',
      message: `An admin changed it from ${claim.assessmentStatus.replace(/_/g, ' ')} to ${nextStatus.replace(/_/g, ' ')}. Reason: ${input.reason}`,
      priority: 'high',
    })
    return this.getDetail(id)
  },

  async correctMetadata(id: string, admin: Admin, input: MetadataInput) {
    const claim = await loadClaim(id)
    const set: Record<string, unknown> = {}
    const unset: Record<string, 1> = {}
    const changed: string[] = []

    if (input.priority !== undefined && input.priority !== claim.priority) {
      set.priority = input.priority
      changed.push('priority')
    }
    if (input.dueAt !== undefined) {
      const next = input.dueAt ? endOfDay(input.dueAt) : undefined
      if (next?.getTime() !== claim.dueAt?.getTime()) {
        if (next) set.dueAt = next
        else unset.dueAt = 1
        changed.push('dueAt')
      }
    }
    for (const field of ['context', 'checkReason'] as const) {
      const value = input[field]
      if (value !== undefined && (value || undefined) !== claim[field]) {
        if (value) set[field] = value
        else unset[field] = 1
        changed.push(field)
      }
    }
    if (changed.length === 0) throw new AppError('Nothing changed.', 400)

    await claimRepository.update(id, {
      ...(Object.keys(set).length > 0 ? { $set: set } : {}),
      ...(Object.keys(unset).length > 0 ? { $unset: unset } : {}),
    })
    await claimEventService.record({ claim, actor: admin, action: 'metadata_corrected', changedFields: changed, note: input.note })
    return this.getDetail(id)
  },

  async comment(id: string, admin: Admin, input: CommentInput) {
    const claim = await loadClaim(id)
    await claimEventService.record({ claim, actor: admin, action: 'comment', note: input.note })
    // A comment is activity, so the record's "last updated" reflects it.
    await claimRepository.update(id, { $set: { updatedAt: new Date() } })
    return this.getDetail(id)
  },

  async linkInvestigation(id: string, admin: Admin, input: InvestigationLinkInput) {
    const claim = await loadClaim(id)
    if (input.investigationId) {
      if (!(await adminClaimRepository.investigationExists(input.investigationId))) {
        throw new AppError('Investigation not found.', 404)
      }
      await claimRepository.update(id, { $set: { investigation: input.investigationId } })
    } else {
      await claimRepository.update(id, { $unset: { investigation: 1 } })
    }
    await claimEventService.record({
      claim,
      actor: admin,
      action: 'investigation_linked',
      note: input.investigationId ? input.note ?? 'Linked an investigation' : input.note ?? 'Removed the investigation link',
    })
    return this.getDetail(id)
  },
}
