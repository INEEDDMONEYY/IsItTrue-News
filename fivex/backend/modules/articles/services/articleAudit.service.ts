import { Types } from 'mongoose'
import { logger } from '../../../config/logger.js'
import type { Role } from '../../../shared/constants/roles.js'
import { userRepository } from '../../users/repositories/user.repository.js'
import { ARTICLE_STATUSES, type ArticleStatus } from '../constants/articleStatus.js'
import type { ArticleAuditAction } from '../constants/articleAudit.js'
import { articleAuditRepository } from '../repositories/articleAudit.repository.js'

interface Actor {
  id: string
  role: Role
}

interface AuditSubject {
  _id: { toString(): string }
  title: string
}

// What a move between two statuses is called in the history.
export function actionForTransition(from: ArticleStatus, to: ArticleStatus): ArticleAuditAction {
  if (from === ARTICLE_STATUSES.DRAFT && to === ARTICLE_STATUSES.PENDING_REVIEW) return 'submitted'
  if (from === ARTICLE_STATUSES.DRAFT && to === ARTICLE_STATUSES.PUBLISHED) return 'published'
  if (from === ARTICLE_STATUSES.PENDING_REVIEW && to === ARTICLE_STATUSES.PUBLISHED) return 'approved'
  if (from === ARTICLE_STATUSES.PENDING_REVIEW && to === ARTICLE_STATUSES.DRAFT) return 'withdrawn'
  if (from === ARTICLE_STATUSES.PUBLISHED && to === ARTICLE_STATUSES.DRAFT) return 'unpublished'
  return 'status_changed'
}

interface RecordInput {
  article: AuditSubject
  actor: Actor
  action: ArticleAuditAction
  fromStatus?: ArticleStatus
  toStatus?: ArticleStatus
  note?: string
  changedFields?: string[]
}

export const articleAuditService = {
  // The record is a side effect of the action it describes, so a failure to write it is logged loudly but
  // must not undo or block an editorial decision that has already been made.
  async record(input: RecordInput): Promise<void> {
    try {
      const actorUser = await userRepository.findById(input.actor.id)
      await articleAuditRepository.record({
        article: new Types.ObjectId(input.article._id.toString()),
        articleTitle: input.article.title,
        action: input.action,
        actor: new Types.ObjectId(input.actor.id),
        actorName: actorUser?.name ?? 'Unknown user',
        actorRole: input.actor.role,
        ...(input.fromStatus ? { fromStatus: input.fromStatus } : {}),
        ...(input.toStatus ? { toStatus: input.toStatus } : {}),
        ...(input.note ? { note: input.note } : {}),
        ...(input.changedFields?.length ? { changedFields: input.changedFields } : {}),
      })
    } catch (error) {
      logger.error(`Failed to write the audit entry "${input.action}" for article ${input.article._id}.`, error)
    }
  },

  async listForArticle(articleId: string, limit = 200) {
    const [entries, total] = await Promise.all([
      articleAuditRepository.findByArticle(articleId, limit),
      articleAuditRepository.countByArticle(articleId),
    ])
    return { entries, total }
  },
}
