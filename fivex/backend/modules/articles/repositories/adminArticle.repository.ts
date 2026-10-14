import { Types, type PipelineStage, type FilterQuery } from 'mongoose'
import { Article, type IArticle, type ArticleDocument } from '../models/Article.js'
import type { ArticleStatus } from '../constants/articleStatus.js'
import type { ArticleFactCheckStatus } from '../models/Article.js'

export interface AdminArticleFilter {
  // Already-escaped regex source matched against title and tags.
  searchPattern?: string
  searchId?: string
  matchingAuthorIds?: string[]
  status?: ArticleStatus
  category?: string
  factCheckStatus?: ArticleFactCheckStatus
  createdFrom?: Date
  createdTo?: Date
}

export interface AdminArticleSort {
  field: 'createdAt' | 'updatedAt' | 'views' | 'title'
  direction: 1 | -1
}

// What the table needs: no body, no engagement arrays, so a page of 100 stays small.
const LIST_FIELDS =
  'title slug category status factCheckStatus author views likesCount editorialStage editorialDeadline createdAt updatedAt publishedAt submittedAt'

function buildMatch(filter: AdminArticleFilter, options: { ignoreStatus?: boolean } = {}): FilterQuery<IArticle> {
  const and: FilterQuery<IArticle>[] = []

  if (filter.searchPattern !== undefined) {
    const regex = { $regex: filter.searchPattern, $options: 'i' }
    const anyOf: FilterQuery<IArticle>[] = [{ title: regex }, { tags: regex }]
    if (filter.matchingAuthorIds?.length) {
      anyOf.push({ author: { $in: filter.matchingAuthorIds.map((id) => new Types.ObjectId(id)) } })
    }
    if (filter.searchId) anyOf.push({ _id: new Types.ObjectId(filter.searchId) })
    and.push({ $or: anyOf })
  }
  if (filter.status && !options.ignoreStatus) and.push({ status: filter.status })
  if (filter.category) and.push({ category: filter.category })
  if (filter.factCheckStatus) and.push({ factCheckStatus: filter.factCheckStatus })
  if (filter.createdFrom || filter.createdTo) {
    and.push({
      createdAt: {
        ...(filter.createdFrom ? { $gte: filter.createdFrom } : {}),
        ...(filter.createdTo ? { $lte: filter.createdTo } : {}),
      },
    })
  }

  return and.length ? { $and: and } : {}
}

export const adminArticleRepository = {
  async search(
    filter: AdminArticleFilter,
    sort: AdminArticleSort,
    page: number,
    pageSize: number,
  ): Promise<{ rows: ArticleDocument[]; total: number }> {
    const match = buildMatch(filter)
    const [rows, total] = await Promise.all([
      Article.find(match)
        .select(LIST_FIELDS)
        // _id breaks ties so a page boundary never repeats or skips an article.
        .sort({ [sort.field]: sort.direction, _id: sort.direction })
        .collation({ locale: 'en', strength: 2 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .populate('author', 'name'),
      Article.countDocuments(match),
    ])
    return { rows, total }
  },

  // Counts for the status tabs: every other filter applies, but the status filter does not, so each tab shows
  // how many articles it would list.
  async countByStatus(filter: AdminArticleFilter): Promise<Record<string, number>> {
    const pipeline: PipelineStage[] = [
      { $match: buildMatch(filter, { ignoreStatus: true }) },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]
    const groups = await Article.aggregate<{ _id: string; count: number }>(pipeline)
    return Object.fromEntries(groups.map((group) => [group._id, group.count]))
  },

  async findDetailById(id: string): Promise<ArticleDocument | null> {
    return Article.findById(id)
      .populate('author', 'name')
      .populate('reviewedBy', 'name')
      .populate('factCheckReviewedBy', 'name')
  },

  async listCategories(): Promise<string[]> {
    const categories = await Article.distinct('category')
    return categories.filter(Boolean).sort((a, b) => a.localeCompare(b))
  },
}
