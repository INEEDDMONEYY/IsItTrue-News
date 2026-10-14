import { Types, type PipelineStage } from 'mongoose'
import { Article } from '../../articles/models/Article.js'
import { User } from '../../users/models/User.js'
import { CONCLUDING_ASSESSMENTS, type ConcludingAssessment } from '../constants/claimStatus.js'
import { Claim, type ClaimDocument } from '../models/Claim.js'
import { ClaimEvent } from '../models/ClaimEvent.js'

// What makes a fact-check public. A claim counts only once it has a conclusion, and only while its article is
// published and has not been flagged by an admin. Everything else stays internal: a returned or escalated claim
// has no conclusion, so withdrawing one takes it off the public pages straight away.
const PUBLIC_ARTICLE = { status: 'published', factCheckStatus: { $ne: 'rejected' } }
const CONCLUDED = { workflowStatus: 'completed', assessmentStatus: { $in: [...CONCLUDING_ASSESSMENTS] } }

// Evidence an admin has restricted is never shown, not even as a placeholder.
const openEvidence = { $filter: { input: { $ifNull: ['$evidence', []] }, as: 'item', cond: { $ne: ['$$item.restricted', true] } } }

export interface PublicFactCheckRow {
  _id: Types.ObjectId
  text: string
  assessmentStatus: ConcludingAssessment
  assessment?: { conclusion?: string; reasoning?: string }
  reviewedAt?: Date
  articleDoc: { _id: Types.ObjectId; title: string; slug: string; category: string }
  reviewerDoc?: { name: string }
  sourceCount: number
}

function articleLookup(): PipelineStage[] {
  return [
    {
      $lookup: {
        from: Article.collection.name,
        localField: 'article',
        foreignField: '_id',
        as: 'articleDoc',
        pipeline: [{ $match: PUBLIC_ARTICLE }, { $project: { title: 1, slug: 1, category: 1 } }],
      },
    },
    { $addFields: { articleDoc: { $first: '$articleDoc' } } },
    // A claim on an unpublished or flagged article has no articleDoc and drops out here.
    { $match: { articleDoc: { $exists: true } } },
  ]
}

function searchStage(escapedSearch: string | undefined): PipelineStage[] {
  if (escapedSearch === undefined) return []
  const regex = { $regex: escapedSearch, $options: 'i' }
  return [{ $match: { $or: [{ text: regex }, { 'articleDoc.title': regex }] } }]
}

export const publicClaimRepository = {
  async search(input: { verdict?: string; escapedSearch?: string; page: number; pageSize: number }) {
    const pipeline: PipelineStage[] = [
      { $match: { ...CONCLUDED, ...(input.verdict ? { assessmentStatus: input.verdict } : {}) } },
      ...articleLookup(),
      ...searchStage(input.escapedSearch),
      {
        $lookup: {
          from: User.collection.name,
          localField: 'reviewedBy',
          foreignField: '_id',
          as: 'reviewerDoc',
          pipeline: [{ $project: { name: 1 } }],
        },
      },
      { $addFields: { reviewerDoc: { $first: '$reviewerDoc' } } },
      // _id breaks ties so a page boundary never repeats or skips a record.
      { $sort: { reviewedAt: -1, _id: -1 } },
      {
        $facet: {
          rows: [
            { $skip: (input.page - 1) * input.pageSize },
            { $limit: input.pageSize },
            {
              $project: {
                text: 1,
                assessmentStatus: 1,
                'assessment.conclusion': 1,
                'assessment.reasoning': 1,
                reviewedAt: 1,
                articleDoc: 1,
                reviewerDoc: 1,
                sourceCount: {
                  $add: [
                    // Only web addresses count: the others are never shown as links.
                    {
                      $size: {
                        $filter: {
                          input: { $ifNull: ['$sources', []] },
                          as: 'source',
                          cond: { $regexMatch: { input: '$$source', regex: /^https?:\/\//i } },
                        },
                      },
                    },
                    { $size: openEvidence },
                  ],
                },
              },
            },
          ],
          total: [{ $count: 'count' }],
        },
      },
    ]
    const [result] = await Claim.aggregate<{ rows: PublicFactCheckRow[]; total: { count: number }[] }>(pipeline)
    return { rows: result?.rows ?? [], total: result?.total[0]?.count ?? 0 }
  },

  // How many public fact-checks each verdict has, under the same search. Used for the filter tabs, so a tab's
  // number is what choosing it would list.
  async countByVerdict(escapedSearch: string | undefined): Promise<Record<string, number>> {
    const groups = await Claim.aggregate<{ _id: string; count: number }>([
      { $match: CONCLUDED },
      ...articleLookup(),
      ...searchStage(escapedSearch),
      { $group: { _id: '$assessmentStatus', count: { $sum: 1 } } },
    ])
    return Object.fromEntries(groups.map((group) => [group._id, group.count]))
  },

  // A single record, only if it is public. Anything else is "not found", so the existence of an unpublished or
  // withdrawn record isn't revealed.
  async findPublicById(id: string): Promise<ClaimDocument | null> {
    const claim = await Claim.findOne({ _id: id, ...CONCLUDED }).populate([
      { path: 'article', match: PUBLIC_ARTICLE, select: 'title slug category publishedAt corrections' },
      { path: 'reviewedBy', select: 'name' },
    ])
    if (!claim || !claim.article || claim.article instanceof Types.ObjectId) return null
    return claim
  },

  async lastRevisedAt(claimId: string): Promise<Date | null> {
    const event = await ClaimEvent.findOne({ claim: claimId, action: 'assessment_revised' })
      .sort({ createdAt: -1 })
      .select('createdAt')
    return event?.createdAt ?? null
  },

  async findPublishedArticleBySlug(slug: string) {
    return Article.findOne({ slug: slug.toLowerCase(), status: 'published' })
      .select('title slug category factCheckStatus factCheckReviewedAt factCheckReviewedBy')
      .populate('factCheckReviewedBy', 'name')
  },

  async concludedForArticle(articleId: string): Promise<ClaimDocument[]> {
    return Claim.find({ article: articleId, ...CONCLUDED })
      .sort({ reviewedAt: -1, _id: -1 })
      .limit(100)
      .populate('reviewedBy', 'name')
  },

  async openCountForArticle(articleId: string): Promise<number> {
    return Claim.countDocuments({ article: articleId, workflowStatus: { $ne: 'completed' } })
  },
}
