import type { PipelineStage } from 'mongoose'
import { Article } from '../../articles/models/Article.js'
import { ArticleView } from '../../articles/models/ArticleView.js'
import type { DateRange } from '../validations/editorialAnalytics.validation.js'

export interface ArticleViewTotals {
  views: number
  readingSeconds: number
  readingSamples: number
}

export interface ArticlePerformanceRow {
  articleId: string
  title: string
  slug: string
  category: string | null
  publishedAt: Date | null
  views: number
  uniqueVisitors: number
  readingSeconds: number
  readingSamples: number
}

export interface ArticleSliceRow {
  key: string
  articles: number
  views: number
  readingSeconds: number
  readingSamples: number
}

// Views per article in the range, with per-visitor grouping first so unique visitors are counted per article.
function perArticleStages(range: DateRange): PipelineStage[] {
  return [
    { $match: { createdAt: { $gte: range.start, $lt: range.end } } },
    {
      $group: {
        _id: { article: '$article', visitorHash: '$visitorHash' },
        views: { $sum: 1 },
        readingSeconds: { $sum: '$readingSeconds' },
        readingSamples: { $sum: { $cond: [{ $gt: ['$readingSeconds', 0] }, 1, 0] } },
      },
    },
    {
      $group: {
        _id: '$_id.article',
        views: { $sum: '$views' },
        uniqueVisitors: { $sum: 1 },
        readingSeconds: { $sum: '$readingSeconds' },
        readingSamples: { $sum: '$readingSamples' },
      },
    },
    { $lookup: { from: Article.collection.name, localField: '_id', foreignField: '_id', as: 'article' } },
    // Articles that no longer exist are dropped rather than reported without a title.
    { $unwind: '$article' },
  ]
}

export const articlePerformanceRepository = {
  // Totals over all views in the range. Unique visitors are counted across the whole range.
  async totals(range: DateRange): Promise<ArticleViewTotals & { uniqueVisitors: number }> {
    const [totalRows, visitorRows] = await Promise.all([
      ArticleView.aggregate<ArticleViewTotals>([
        { $match: { createdAt: { $gte: range.start, $lt: range.end } } },
        {
          $group: {
            _id: null,
            views: { $sum: 1 },
            readingSeconds: { $sum: '$readingSeconds' },
            readingSamples: { $sum: { $cond: [{ $gt: ['$readingSeconds', 0] }, 1, 0] } },
          },
        },
        { $project: { _id: 0, views: 1, readingSeconds: 1, readingSamples: 1 } },
      ]),
      ArticleView.aggregate<{ uniqueVisitors: number }>([
        { $match: { createdAt: { $gte: range.start, $lt: range.end } } },
        { $group: { _id: '$visitorHash' } },
        { $count: 'uniqueVisitors' },
      ]),
    ])
    return {
      views: totalRows[0]?.views ?? 0,
      readingSeconds: totalRows[0]?.readingSeconds ?? 0,
      readingSamples: totalRows[0]?.readingSamples ?? 0,
      uniqueVisitors: visitorRows[0]?.uniqueVisitors ?? 0,
    }
  },

  // Highest-viewed articles in the range.
  topArticles(range: DateRange, limit: number): Promise<ArticlePerformanceRow[]> {
    return ArticleView.aggregate<ArticlePerformanceRow>([
      ...perArticleStages(range),
      { $sort: { views: -1, _id: 1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          articleId: { $toString: '$_id' },
          title: '$article.title',
          slug: '$article.slug',
          category: { $ifNull: ['$article.category', null] },
          publishedAt: { $ifNull: ['$article.publishedAt', null] },
          views: 1,
          uniqueVisitors: 1,
          readingSeconds: 1,
          readingSamples: 1,
        },
      },
    ], { allowDiskUse: true })
  },

  // Views grouped by article category. Unique visitors are omitted because they cannot be summed across articles.
  byCategory(range: DateRange): Promise<ArticleSliceRow[]> {
    return ArticleView.aggregate<ArticleSliceRow>([
      ...perArticleStages(range),
      {
        $group: {
          _id: { $ifNull: ['$article.category', 'uncategorized'] },
          articles: { $sum: 1 },
          views: { $sum: '$views' },
          readingSeconds: { $sum: '$readingSeconds' },
          readingSamples: { $sum: '$readingSamples' },
        },
      },
      { $sort: { views: -1, _id: 1 } },
      { $project: { _id: 0, key: '$_id', articles: 1, views: 1, readingSeconds: 1, readingSamples: 1 } },
    ], { allowDiskUse: true })
  },

  // Views grouped by the UTC month the article was published. Unpublished or undated articles fall into "unknown".
  byPublicationMonth(range: DateRange): Promise<ArticleSliceRow[]> {
    return ArticleView.aggregate<ArticleSliceRow>([
      ...perArticleStages(range),
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$article.publishedAt', null] },
              'unknown',
              { $dateToString: { format: '%Y-%m', date: '$article.publishedAt', timezone: 'UTC' } },
            ],
          },
          articles: { $sum: 1 },
          views: { $sum: '$views' },
          readingSeconds: { $sum: '$readingSeconds' },
          readingSamples: { $sum: '$readingSamples' },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, key: '$_id', articles: 1, views: 1, readingSeconds: 1, readingSamples: 1 } },
    ], { allowDiskUse: true })
  },
}
