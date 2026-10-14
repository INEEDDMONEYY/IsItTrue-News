import { Types } from 'mongoose'
import { AppError } from '../../../shared/errors/AppError.js'
import type { Role } from '../../../shared/constants/roles.js'
import { escapeRegex } from '../../../utils/escapeRegex.js'
import { userRepository } from '../../users/repositories/user.repository.js'
import { ARTICLE_STATUSES, ALL_ARTICLE_STATUSES, type ArticleStatus } from '../constants/articleStatus.js'
import type { ArticleDocument } from '../models/Article.js'
import type { ArticleAuditLogDocument } from '../models/ArticleAuditLog.js'
import { adminArticleRepository, type AdminArticleFilter } from '../repositories/adminArticle.repository.js'
import type { AdminArticleListQuery, AdminArticleStatusInput } from '../validations/adminArticle.validation.js'
import { articleAuditService } from './articleAudit.service.js'
import { articleService } from './article.service.js'

interface Admin {
  id: string
  role: Role
}

// Where an admin can move an article from each status. Anything not listed is refused by the server, so the
// UI can only offer what is valid and a hand-made request can't skip a step.
const ALLOWED_TRANSITIONS: Record<ArticleStatus, ArticleStatus[]> = {
  [ARTICLE_STATUSES.DRAFT]: [ARTICLE_STATUSES.PENDING_REVIEW, ARTICLE_STATUSES.PUBLISHED],
  [ARTICLE_STATUSES.PENDING_REVIEW]: [ARTICLE_STATUSES.PUBLISHED, ARTICLE_STATUSES.DRAFT],
  [ARTICLE_STATUSES.PUBLISHED]: [ARTICLE_STATUSES.DRAFT],
}

const STATUS_LABEL: Record<ArticleStatus, string> = {
  [ARTICLE_STATUSES.DRAFT]: 'a draft',
  [ARTICLE_STATUSES.PENDING_REVIEW]: 'in review',
  [ARTICLE_STATUSES.PUBLISHED]: 'published',
}

interface PersonRef {
  id: string
  name: string
}

// A populated reference, an unpopulated id, or null when the user no longer exists.
function toPerson(value: unknown): PersonRef | null {
  if (!value || value instanceof Types.ObjectId) return null
  const person = value as { _id?: { toString(): string }; name?: string }
  return person._id && person.name ? { id: person._id.toString(), name: person.name } : null
}

function toIso(date: Date | undefined | null): string | null {
  return date ? date.toISOString() : null
}

function toListRow(article: ArticleDocument) {
  return {
    id: article._id.toString(),
    title: article.title,
    slug: article.slug,
    category: article.category,
    status: article.status,
    factCheckStatus: article.factCheckStatus,
    author: toPerson(article.author),
    views: article.views,
    likes: article.likesCount,
    editorialStage: article.editorialStage ?? null,
    editorialDeadline: toIso(article.editorialDeadline),
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
    publishedAt: toIso(article.publishedAt),
    submittedAt: toIso(article.submittedAt),
  }
}

function estimateReadTimeMinutes(html: string): number {
  const words = html.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

function toDetail(article: ArticleDocument) {
  return {
    ...toListRow(article),
    excerpt: article.excerpt,
    body: article.body,
    tags: article.tags,
    readTimeMinutes: estimateReadTimeMinutes(article.body),
    articleImageUrl: article.articleImageUrl ?? null,
    articleVideoUrl: article.articleVideoUrl ?? null,
    videoThumbnailUrl: article.videoThumbnailUrl ?? null,
    sourceLinks: article.sourceLinks,
    socialLinks: article.socialLinks,
    reviewNote: article.reviewNote ?? null,
    reviewRequirements: article.reviewRequirements.map((requirement) => ({
      id: requirement._id.toString(),
      text: requirement.text,
      done: requirement.done,
    })),
    reviewedAt: toIso(article.reviewedAt),
    reviewedBy: toPerson(article.reviewedBy),
    corrections: article.corrections.map((correction) => ({
      number: correction.number,
      text: correction.text,
      publishedAt: correction.publishedAt.toISOString(),
    })),
    factCheckRejectionReason: article.factCheckRejectionReason ?? null,
    factCheckReviewedAt: toIso(article.factCheckReviewedAt),
    factCheckReviewedBy: toPerson(article.factCheckReviewedBy),
    engagement: {
      likes: article.likesCount,
      dislikes: article.dislikesCount,
      shares: article.sharesCount,
      bookmarks: article.bookmarksCount,
    },
    allowedStatuses: ALLOWED_TRANSITIONS[article.status],
  }
}

function toAuditEntry(entry: ArticleAuditLogDocument) {
  return {
    id: entry._id.toString(),
    action: entry.action,
    actor: { id: entry.actor.toString(), name: entry.actorName, role: entry.actorRole },
    fromStatus: entry.fromStatus ?? null,
    toStatus: entry.toStatus ?? null,
    note: entry.note ?? null,
    changedFields: entry.changedFields ?? [],
    createdAt: entry.createdAt.toISOString(),
  }
}

// "2026-03-31" as a whole day in UTC: from is the start of that day, to is the very end of it.
function startOfDay(date: string) {
  return new Date(`${date}T00:00:00.000Z`)
}
function endOfDay(date: string) {
  return new Date(`${date}T23:59:59.999Z`)
}

async function buildFilter(query: AdminArticleListQuery): Promise<AdminArticleFilter> {
  const filter: AdminArticleFilter = {
    status: query.status as ArticleStatus | undefined,
    category: query.category,
    factCheckStatus: query.factCheckStatus,
    createdFrom: query.from ? startOfDay(query.from) : undefined,
    createdTo: query.to ? endOfDay(query.to) : undefined,
  }

  if (query.q) {
    filter.searchPattern = escapeRegex(query.q)
    // Searching for a person finds the articles they wrote.
    filter.matchingAuthorIds = await userRepository.findIdsByNamePattern(filter.searchPattern)
    // Pasting an article id jumps straight to it.
    if (/^[a-f\d]{24}$/i.test(query.q)) filter.searchId = query.q
  }

  return filter
}

export const adminArticleService = {
  async list(query: AdminArticleListQuery) {
    const filter = await buildFilter(query)
    const [{ rows, total }, statusCounts, categories] = await Promise.all([
      adminArticleRepository.search(
        filter,
        { field: query.sort, direction: query.order === 'asc' ? 1 : -1 },
        query.page,
        query.pageSize,
      ),
      adminArticleRepository.countByStatus(filter),
      adminArticleRepository.listCategories(),
    ])

    const counts = Object.fromEntries(ALL_ARTICLE_STATUSES.map((status) => [status, statusCounts[status] ?? 0]))
    return {
      articles: rows.map(toListRow),
      total,
      page: query.page,
      pageSize: query.pageSize,
      totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
      // The tabs' numbers: "all" is the sum of every status under the other filters.
      counts: { ...counts, all: Object.values(counts).reduce((sum, count) => sum + count, 0) },
      categories,
    }
  },

  async getDetail(id: string) {
    const article = await adminArticleRepository.findDetailById(id)
    if (!article) throw new AppError('Article not found.', 404)
    return toDetail(article)
  },

  // Works for deleted articles too: the history is kept after the article itself is gone.
  async getAuditTrail(id: string) {
    const { entries, total } = await articleAuditService.listForArticle(id)
    return { entries: entries.map(toAuditEntry), total }
  },

  async changeStatus(id: string, admin: Admin, input: AdminArticleStatusInput) {
    const target = input.status as ArticleStatus
    const article = await adminArticleRepository.findDetailById(id)
    if (!article) throw new AppError('Article not found.', 404)

    if (!ALLOWED_TRANSITIONS[article.status].includes(target)) {
      throw new AppError(
        `This article is ${STATUS_LABEL[article.status]}, so it can't be moved to ${STATUS_LABEL[target]}.`,
        409,
      )
    }

    // Each move goes through the article service so it is audited, and the author and editors are told,
    // exactly as when an editor makes the same decision.
    if (article.status === ARTICLE_STATUSES.PENDING_REVIEW && target === ARTICLE_STATUSES.PUBLISHED) {
      await articleService.approveArticle(id, admin)
    } else if (article.status === ARTICLE_STATUSES.PENDING_REVIEW && target === ARTICLE_STATUSES.DRAFT) {
      await articleService.requestChanges(id, admin, { requirements: [], note: input.note })
    } else if (article.status === ARTICLE_STATUSES.PUBLISHED && target === ARTICLE_STATUSES.DRAFT) {
      await articleService.unpublishArticle(id, admin, input.note as string)
    } else {
      await articleService.updateStatus(id, target, admin, { note: input.note })
    }

    return this.getDetail(id)
  },

  async remove(id: string, admin: Admin) {
    await articleService.deleteArticle(id, admin)
  },
}
