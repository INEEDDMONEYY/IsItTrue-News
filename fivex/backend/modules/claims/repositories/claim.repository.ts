import { Types } from 'mongoose'
import { Claim, type ClaimDocument } from '../models/Claim.js'
import { OPEN_CLAIM_STATUSES, type ClaimStatus, type EvidenceStatus } from '../constants/claimStatus.js'

export interface CreateClaimRepoInput {
  article: string
  text: string
  createdBy: string
  assignee?: string
}

export interface ClaimChanges {
  set: Partial<{
    text: string
    status: ClaimStatus
    evidenceStatus: EvidenceStatus
    evidenceSummary: string
    sources: string[]
    assignee: string
    reviewedBy: string
    reviewedAt: Date
  }>
  unset: Array<'assignee' | 'evidenceSummary' | 'reviewedBy' | 'reviewedAt'>
}

// Oversight lists are capped so one noisy article can't make the dashboard unbounded.
const OVERSIGHT_LIMIT = 500

export const claimRepository = {
  async create(input: CreateClaimRepoInput): Promise<ClaimDocument> {
    return Claim.create(input)
  },

  async findById(id: string): Promise<ClaimDocument | null> {
    return Claim.findById(id)
  },

  async findByIdPopulated(id: string): Promise<ClaimDocument | null> {
    return Claim.findById(id)
      .populate('article', 'title slug status')
      .populate('assignee', 'name')
      .populate('reviewedBy', 'name')
      .populate('createdBy', 'name')
  },

  async findAll(): Promise<ClaimDocument[]> {
    return Claim.find()
      .sort({ updatedAt: -1 })
      .limit(OVERSIGHT_LIMIT)
      .populate('article', 'title slug status')
      .populate('assignee', 'name')
      .populate('reviewedBy', 'name')
      .populate('createdBy', 'name')
  },

  async update(id: string, changes: ClaimChanges): Promise<void> {
    const unset = Object.fromEntries(changes.unset.map((field) => [field, 1]))
    await Claim.updateOne(
      { _id: id },
      {
        ...(Object.keys(changes.set).length > 0 ? { $set: changes.set } : {}),
        ...(changes.unset.length > 0 ? { $unset: unset } : {}),
      },
    )
  },

  async deleteById(id: string): Promise<void> {
    await Claim.deleteOne({ _id: id })
  },

  // Claim counts per article, broken down by status.
  async countsByArticle(articleIds: string[]): Promise<Map<string, Partial<Record<ClaimStatus, number>>>> {
    const rows = await Claim.aggregate<{ _id: { article: Types.ObjectId; status: ClaimStatus }; count: number }>([
      { $match: { article: { $in: articleIds.map((id) => new Types.ObjectId(id)) } } },
      { $group: { _id: { article: '$article', status: '$status' }, count: { $sum: 1 } } },
    ])

    const counts = new Map<string, Partial<Record<ClaimStatus, number>>>()
    for (const row of rows) {
      const key = row._id.article.toString()
      counts.set(key, { ...counts.get(key), [row._id.status]: row.count })
    }
    return counts
  },

  async countForArticle(articleId: string): Promise<{ total: number; open: number }> {
    const [total, open] = await Promise.all([
      Claim.countDocuments({ article: articleId }),
      Claim.countDocuments({ article: articleId, status: { $in: OPEN_CLAIM_STATUSES } }),
    ])
    return { total, open }
  },
}
