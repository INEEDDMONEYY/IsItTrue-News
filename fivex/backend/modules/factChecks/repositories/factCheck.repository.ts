import { FactCheckRequest, type FactCheckRequestDocument } from '../models/FactCheckRequest.js'
import { FACT_CHECK_STATUSES, type FactCheckStatus } from '../constants/factCheckStatus.js'

export interface CreateFactCheckRequestData {
  article: string
  requestedBy: string
  claim: string
  sources: string
  notes: string
}

const POPULATE_ARTICLE = 'title slug status factCheckStatus'
const POPULATE_USER = 'name email role'

export const factCheckRepository = {
  async findById(id: string): Promise<FactCheckRequestDocument | null> {
    return FactCheckRequest.findById(id)
  },

  async findByRequester(requestedBy: string): Promise<FactCheckRequestDocument[]> {
    return FactCheckRequest.find({ requestedBy })
      .sort({ createdAt: -1 })
      .populate('article', POPULATE_ARTICLE)
      .populate('requestedBy', POPULATE_USER)
      .populate('reviewedBy', POPULATE_USER)
  },

  async findByStatus(status: FactCheckStatus): Promise<FactCheckRequestDocument[]> {
    return FactCheckRequest.find({ status })
      .sort({ createdAt: -1 })
      .populate('article', POPULATE_ARTICLE)
      .populate('requestedBy', POPULATE_USER)
      .populate('reviewedBy', POPULATE_USER)
  },

  async findAll(): Promise<FactCheckRequestDocument[]> {
    return FactCheckRequest.find()
      .sort({ createdAt: -1 })
      .populate('article', POPULATE_ARTICLE)
      .populate('requestedBy', POPULATE_USER)
      .populate('reviewedBy', POPULATE_USER)
  },

  async hasPendingForArticle(articleId: string): Promise<boolean> {
    const existing = await FactCheckRequest.findOne({
      article: articleId,
      status: FACT_CHECK_STATUSES.PENDING,
    })
    return Boolean(existing)
  },

  async create(input: CreateFactCheckRequestData): Promise<FactCheckRequestDocument> {
    return FactCheckRequest.create(input)
  },

  async setApproved(id: string, reviewedBy: string): Promise<void> {
    await FactCheckRequest.updateOne(
      { _id: id },
      {
        $set: { status: FACT_CHECK_STATUSES.APPROVED, reviewedBy, reviewedAt: new Date() },
        $unset: { rejectionReason: 1 },
      },
    )
  },

  async setRejected(id: string, reviewedBy: string, reason: string): Promise<void> {
    await FactCheckRequest.updateOne(
      { _id: id },
      {
        $set: {
          status: FACT_CHECK_STATUSES.REJECTED,
          reviewedBy,
          reviewedAt: new Date(),
          rejectionReason: reason,
        },
      },
    )
  },
}
