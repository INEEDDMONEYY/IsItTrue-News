import { Types, type UpdateQuery } from 'mongoose'
import { Claim, type ClaimDocument, type IClaim } from '../models/Claim.js'
import { legacyStatus, type AssessmentStatus, type ClaimStatus, type WorkflowStatus } from '../constants/claimStatus.js'

export interface CreateClaimRepoInput {
  article: string
  text: string
  createdBy: string
  assignee?: string
}

// Oversight lists are capped so one noisy article can't make the dashboard unbounded.
const OVERSIGHT_LIMIT = 500

const POPULATE = [
  { path: 'article', select: 'title slug status' },
  { path: 'assignee', select: 'name' },
  { path: 'reviewedBy', select: 'name' },
  { path: 'createdBy', select: 'name' },
]

export const claimRepository = {
  async create(input: CreateClaimRepoInput): Promise<ClaimDocument> {
    return Claim.create(input)
  },

  async findById(id: string): Promise<ClaimDocument | null> {
    return Claim.findById(id)
  },

  async findByIdPopulated(id: string): Promise<ClaimDocument | null> {
    return Claim.findById(id).populate(POPULATE)
  },

  async findAll(): Promise<ClaimDocument[]> {
    return Claim.find().sort({ updatedAt: -1 }).limit(OVERSIGHT_LIMIT).populate(POPULATE)
  },

  // The change only applies if the claim is still in the workflow/assessment state the caller read, so two
  // people acting at once can't both succeed on a stale view. Returns whether it applied.
  async updateIfUnchanged(
    id: string,
    expected: { workflowStatus: WorkflowStatus; assessmentStatus: AssessmentStatus },
    update: UpdateQuery<IClaim>,
  ): Promise<boolean> {
    const result = await Claim.updateOne({ _id: id, ...expected }, update)
    return result.matchedCount > 0
  },

  async update(
    id: string,
    update: UpdateQuery<IClaim>,
    arrayFilters?: Record<string, unknown>[],
  ): Promise<void> {
    await Claim.updateOne({ _id: id }, update, arrayFilters ? { arrayFilters } : undefined)
  },

  async deleteById(id: string): Promise<void> {
    await Claim.deleteOne({ _id: id })
  },

  // Claim counts per article, broken down by the combined status the oversight page shows.
  async countsByArticle(articleIds: string[]): Promise<Map<string, Partial<Record<ClaimStatus, number>>>> {
    const rows = await Claim.aggregate<{
      _id: { article: Types.ObjectId; workflow: WorkflowStatus; assessment: AssessmentStatus }
      count: number
    }>([
      { $match: { article: { $in: articleIds.map((id) => new Types.ObjectId(id)) } } },
      {
        $group: {
          _id: { article: '$article', workflow: '$workflowStatus', assessment: '$assessmentStatus' },
          count: { $sum: 1 },
        },
      },
    ])

    const counts = new Map<string, Partial<Record<ClaimStatus, number>>>()
    for (const row of rows) {
      const key = row._id.article.toString()
      const status = legacyStatus(row._id.workflow, row._id.assessment)
      const current = counts.get(key) ?? {}
      current[status] = (current[status] ?? 0) + row.count
      counts.set(key, current)
    }
    return counts
  },

  async countForArticle(articleId: string): Promise<{ total: number; open: number }> {
    const [total, open] = await Promise.all([
      Claim.countDocuments({ article: articleId }),
      Claim.countDocuments({ article: articleId, workflowStatus: { $ne: 'completed' } }),
    ])
    return { total, open }
  },
}
