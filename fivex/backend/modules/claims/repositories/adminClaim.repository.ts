import { Types, type FilterQuery, type PipelineStage } from 'mongoose'
import { Article } from '../../articles/models/Article.js'
import { Correction } from '../../corrections/models/Correction.js'
import { Investigation } from '../../investigations/models/Investigation.js'
import { User } from '../../users/models/User.js'
import {
  CLAIM_PRIORITIES,
  RECENT_DAYS,
  THIN_EVIDENCE_STATUSES,
  type AssessmentStatus,
  type ClaimPriority,
  type EvidenceState,
  type FactCheckView,
  type WorkflowStatus,
} from '../constants/claimStatus.js'
import { Claim, type ClaimDocument, type IClaim } from '../models/Claim.js'
import type { AdminClaimListQuery } from '../validations/adminClaim.validation.js'

export interface ClaimFilter {
  view: FactCheckView
  workflow?: WorkflowStatus
  assessment?: AssessmentStatus
  evidence?: EvidenceState
  priority?: ClaimPriority
  assignee?: string
}

const DAY_MS = 24 * 60 * 60 * 1000

function viewMatch(view: FactCheckView, now: Date): FilterQuery<IClaim> {
  switch (view) {
    case 'pending':
      return { workflowStatus: 'unreviewed' }
    case 'in_progress':
      return { workflowStatus: 'in_review' }
    case 'disputed':
      return { assessmentStatus: 'disputed' }
    // Reviewed without reaching a firm answer. Not the same as false, and kept visible so it can be revisited.
    case 'unresolved':
      return { assessmentStatus: { $in: ['unverified', 'unable_to_verify'] } }
    case 'overdue':
      return { workflowStatus: { $ne: 'completed' }, dueAt: { $lt: now } }
    case 'completed_recently':
      return { workflowStatus: 'completed', reviewedAt: { $gte: new Date(now.getTime() - RECENT_DAYS * DAY_MS) } }
    case 'escalated':
      return { workflowStatus: 'escalated' }
    case 'returned':
      return { workflowStatus: 'returned' }
    case 'evidence_flagged':
      return { evidenceFlag: { $exists: true } }
    case 'unassigned':
      return { assignee: null, workflowStatus: { $ne: 'completed' } }
    default:
      return {}
  }
}

const itemCount = { $size: { $ifNull: ['$evidence', []] } }
const sourceCount = { $size: { $ifNull: ['$sources', []] } }
const nothingAttached = { $and: [{ $eq: [itemCount, 0] }, { $eq: [sourceCount, 0] }] }
const looksThin = {
  $or: [
    { $ne: [{ $type: '$evidenceFlag' }, 'missing'] },
    { $in: ['$evidenceStatus', [...THIN_EVIDENCE_STATUSES]] },
  ],
}

// The database form of deriveEvidenceState in constants/claimStatus.ts. Keep the two in step.
function evidenceMatch(state: EvidenceState): FilterQuery<IClaim> {
  if (state === 'missing') return { $expr: nothingAttached }
  if (state === 'incomplete') return { $expr: { $and: [{ $not: [nothingAttached] }, looksThin] } }
  return { $expr: { $and: [{ $not: [nothingAttached] }, { $not: [looksThin] }] } }
}

// Everything about a claim that doesn't need another collection to decide.
export function buildClaimMatch(filter: ClaimFilter, now: Date): FilterQuery<IClaim> {
  const and: FilterQuery<IClaim>[] = [viewMatch(filter.view, now)]
  if (filter.workflow) and.push({ workflowStatus: filter.workflow })
  if (filter.assessment) and.push({ assessmentStatus: filter.assessment })
  if (filter.priority) and.push({ priority: filter.priority })
  if (filter.evidence) and.push(evidenceMatch(filter.evidence))
  if (filter.assignee === 'unassigned') and.push({ assignee: null })
  else if (filter.assignee) and.push({ assignee: new Types.ObjectId(filter.assignee) })
  return { $and: and }
}

export interface ClaimListRow {
  _id: Types.ObjectId
  text: string
  workflowStatus: WorkflowStatus
  assessmentStatus: AssessmentStatus
  priority: ClaimPriority
  dueAt?: Date
  evidenceStatus: IClaim['evidenceStatus']
  evidenceItemCount: number
  sourceCount: number
  flagged: boolean
  hasEscalation: boolean
  createdAt: Date
  updatedAt: Date
  articleDoc?: { _id: Types.ObjectId; title: string; slug: string; status: string }
  assigneeDoc?: { _id: Types.ObjectId; name: string }
}

const OBJECT_ID = /^[a-f\d]{24}$/i

export const adminClaimRepository = {
  async search(
    query: AdminClaimListQuery,
    escapedSearch: string | undefined,
    now: Date,
  ): Promise<{ rows: ClaimListRow[]; total: number }> {
    const match = buildClaimMatch(
      {
        view: query.view,
        workflow: query.workflow,
        assessment: query.assessment,
        evidence: query.evidence,
        priority: query.priority,
        assignee: query.assignee,
      },
      now,
    )
    const direction = query.order === 'asc' ? 1 : -1

    const pipeline: PipelineStage[] = [
      { $match: match },
      {
        $lookup: {
          from: Article.collection.name,
          localField: 'article',
          foreignField: '_id',
          as: 'articleDoc',
          pipeline: [{ $project: { title: 1, slug: 1, status: 1 } }],
        },
      },
      {
        $lookup: {
          from: User.collection.name,
          localField: 'assignee',
          foreignField: '_id',
          as: 'assigneeDoc',
          pipeline: [{ $project: { name: 1 } }],
        },
      },
      { $addFields: { articleDoc: { $first: '$articleDoc' }, assigneeDoc: { $first: '$assigneeDoc' } } },
    ]

    if (escapedSearch !== undefined) {
      const regex = { $regex: escapedSearch, $options: 'i' }
      const anyOf: FilterQuery<unknown>[] = [{ text: regex }, { 'articleDoc.title': regex }, { 'assigneeDoc.name': regex }]
      // Pasting a record's id jumps straight to it.
      if (OBJECT_ID.test(escapedSearch)) anyOf.push({ _id: new Types.ObjectId(escapedSearch) })
      pipeline.push({ $match: { $or: anyOf } })
    }

    pipeline.push(
      {
        $addFields: {
          // Enum values sort alphabetically, so urgency needs an explicit rank.
          priorityRank: { $indexOfArray: [[...CLAIM_PRIORITIES], '$priority'] },
          // Records without a deadline sort last in either direction.
          dueSort: { $ifNull: ['$dueAt', direction === 1 ? new Date('9999-12-31') : new Date(0)] },
        },
      },
      {
        $sort: {
          [query.sort === 'priority' ? 'priorityRank' : query.sort === 'dueAt' ? 'dueSort' : query.sort]: direction,
          _id: direction,
        },
      },
      {
        $facet: {
          rows: [
            { $skip: (query.page - 1) * query.pageSize },
            { $limit: query.pageSize },
            {
              $project: {
                text: 1,
                workflowStatus: 1,
                assessmentStatus: 1,
                priority: 1,
                dueAt: 1,
                evidenceStatus: 1,
                createdAt: 1,
                updatedAt: 1,
                articleDoc: 1,
                assigneeDoc: 1,
                evidenceItemCount: itemCount,
                sourceCount,
                flagged: { $ne: [{ $type: '$evidenceFlag' }, 'missing'] },
                hasEscalation: { $ne: [{ $type: '$escalation' }, 'missing'] },
              },
            },
          ],
          total: [{ $count: 'count' }],
        },
      },
    )

    const [result] = await Claim.aggregate<{ rows: ClaimListRow[]; total: { count: number }[] }>(pipeline)
    return { rows: result?.rows ?? [], total: result?.total[0]?.count ?? 0 }
  },

  async count(view: FactCheckView, now: Date): Promise<number> {
    return Claim.countDocuments(buildClaimMatch({ view }, now))
  },

  async findDetail(id: string): Promise<ClaimDocument | null> {
    return Claim.findById(id).populate([
      { path: 'article', select: 'title slug status category factCheckStatus publishedAt' },
      { path: 'assignee', select: 'name role' },
      { path: 'reviewedBy', select: 'name' },
      { path: 'createdBy', select: 'name' },
      { path: 'evidence.addedBy', select: 'name' },
      { path: 'evidence.restrictedBy', select: 'name' },
      { path: 'evidenceFlag.flaggedBy', select: 'name' },
      { path: 'escalation.escalatedBy', select: 'name' },
      { path: 'investigation', select: 'title slug status' },
    ])
  },

  async findRaw(id: string): Promise<ClaimDocument | null> {
    return Claim.findById(id)
  },

  async correctionsForArticle(articleId: string) {
    return Correction.find({ article: articleId })
      .select('status category description publication createdAt')
      .sort({ createdAt: -1 })
      .limit(20)
  },

  async investigationExists(id: string): Promise<boolean> {
    return Boolean(await Investigation.exists({ _id: id }))
  },

  // For the "link an investigation" picker.
  async searchInvestigations(escapedSearch: string | undefined) {
    return Investigation.find(escapedSearch ? { title: { $regex: escapedSearch, $options: 'i' } } : {})
      .select('title slug status')
      .sort({ updatedAt: -1 })
      .limit(50)
  },
}
