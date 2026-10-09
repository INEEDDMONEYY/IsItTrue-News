import { AppError } from '../../../shared/errors/AppError.js'
import { Types } from 'mongoose'
import { ROLES, type Role } from '../../../shared/constants/roles.js'
import { logger } from '../../../config/logger.js'
import { articleRepository } from '../../articles/repositories/article.repository.js'
import { ARTICLE_STATUSES } from '../../articles/constants/articleStatus.js'
import { userRepository } from '../../users/repositories/user.repository.js'
import { notificationService } from '../../notifications/services/notification.service.js'
import { correctionRepository } from '../repositories/correction.repository.js'
import {
  CORRECTION_STATUSES,
  type CorrectionHistoryAction,
  type CorrectionStatus,
} from '../constants/correctionStatus.js'
import type { CorrectionDocument } from '../models/Correction.js'
import type {
  CreateCorrectionInput,
  DismissCorrectionInput,
  PublishCorrectionInput,
  RecordFindingsInput,
} from '../validations/correction.validation.js'

interface ActingUser {
  id: string
  role: Role
}

const MAX_OPEN_REPORTS_PER_USER = 5

async function actorName(userId: string): Promise<string> {
  const user = await userRepository.findById(userId)
  return user?.name ?? 'Unknown'
}

function pushHistory(
  correction: CorrectionDocument,
  entry: { action: CorrectionHistoryAction; by: string; byName: string; note?: string },
) {
  correction.history.push({
    action: entry.action,
    by: new Types.ObjectId(entry.by),
    byName: entry.byName,
    at: new Date(),
    ...(entry.note ? { note: entry.note } : {}),
  })
}

async function loadCorrection(id: string): Promise<CorrectionDocument> {
  const correction = await correctionRepository.findById(id)
  if (!correction) {
    throw new AppError('Correction not found.', 404)
  }
  return correction
}

function assertStatus(correction: CorrectionDocument, allowed: CorrectionStatus[], message: string) {
  if (!allowed.includes(correction.status)) {
    throw new AppError(message, 400)
  }
}

// Notifying is a side effect — it must never fail the action itself.
async function notifyEditorsOfReport(correction: CorrectionDocument, reporter: ActingUser, reporterName: string) {
  try {
    const editorIds = await userRepository.findIdsByRole(ROLES.EDITOR)
    await Promise.all(
      editorIds
        .filter((editorId) => editorId !== reporter.id)
        .map((editorId) =>
          notificationService.notify({
            recipient: editorId,
            type: 'editorial',
            title: 'New correction request',
            message: `${reporterName} reported a possible error in "${correction.articleTitle}".`,
            priority: 'high',
            action: 'review',
            actionLabel: 'Open corrections queue',
            href: '/dashboard/corrections',
            relatedId: correction._id.toString(),
            relatedType: 'correction',
            actor: { id: reporter.id, name: reporterName },
          }),
        ),
    )
  } catch (error) {
    logger.error('Failed to notify editors of a correction request.', error)
  }
}

async function notifyPublished(correction: CorrectionDocument, publisher: ActingUser, publisherName: string) {
  try {
    const article = await articleRepository.findById(correction.article.toString())
    const recipients = new Set<string>([correction.reportedBy.toString()])
    if (article) recipients.add(article.author.toString())
    recipients.delete(publisher.id)

    await Promise.all(
      [...recipients].map((recipient) =>
        notificationService.notify({
          recipient,
          type: 'editorial',
          title: 'A correction was published',
          message: `A correction was added to "${correction.articleTitle}".`,
          priority: 'normal',
          action: 'view',
          actionLabel: 'View article',
          href: `/article/${correction.articleSlug}`,
          relatedId: correction._id.toString(),
          relatedType: 'correction',
          actor: { id: publisher.id, name: publisherName },
        }),
      ),
    )
  } catch (error) {
    logger.error('Failed to notify about a published correction.', error)
  }
}

export const correctionService = {
  // Any signed-in user can flag a possible error on a published article.
  async create(reporter: ActingUser, input: CreateCorrectionInput) {
    const article = await articleRepository.findById(input.articleId)
    if (!article || article.status !== ARTICLE_STATUSES.PUBLISHED) {
      throw new AppError('Corrections can only be filed against published articles.', 404)
    }

    if ((await correctionRepository.countOpenByReporter(reporter.id)) >= MAX_OPEN_REPORTS_PER_USER) {
      throw new AppError('You already have several open correction requests. Please wait for them to be reviewed.', 429)
    }

    const reporterName = await actorName(reporter.id)
    const reporterObjectId = new Types.ObjectId(reporter.id)
    const correction = await correctionRepository.create({
      article: article._id,
      articleTitle: article.title,
      articleSlug: article.slug,
      category: input.category,
      description: input.description,
      suggestedFix: input.suggestedFix,
      evidenceLinks: input.evidenceLinks,
      reportedBy: reporterObjectId,
      reportedByName: reporterName,
      history: [
        {
          action: 'reported',
          by: reporterObjectId,
          byName: reporterName,
          at: new Date(),
          note: input.description,
        },
      ],
    })

    await notifyEditorsOfReport(correction, reporter, reporterName)
    return correction
  },

  async list(status?: CorrectionStatus) {
    const [corrections, counts] = await Promise.all([
      correctionRepository.findAll(status),
      correctionRepository.countByStatus(),
    ])
    return { corrections, counts }
  },

  async getById(id: string) {
    return loadCorrection(id)
  },

  async startInvestigation(id: string, editor: ActingUser) {
    const correction = await loadCorrection(id)
    assertStatus(correction, [CORRECTION_STATUSES.QUEUED], 'Only queued corrections can be investigated.')

    const name = await actorName(editor.id)
    correction.status = CORRECTION_STATUSES.INVESTIGATING
    correction.investigation = {
      investigator: new Types.ObjectId(editor.id),
      investigatorName: name,
      startedAt: new Date(),
    }
    pushHistory(correction, { action: 'investigation_started', by: editor.id, byName: name })
    return correctionRepository.save(correction)
  },

  async recordFindings(id: string, editor: ActingUser, input: RecordFindingsInput) {
    const correction = await loadCorrection(id)
    assertStatus(
      correction,
      [CORRECTION_STATUSES.INVESTIGATING],
      'Findings can only be recorded while a correction is under investigation.',
    )
    if (!correction.investigation) {
      throw new AppError('This correction has no active investigation.', 400)
    }

    const name = await actorName(editor.id)
    correction.investigation.findings = input.findings
    correction.investigation.verdict = input.verdict
    correction.markModified('investigation')
    pushHistory(correction, {
      action: 'findings_recorded',
      by: editor.id,
      byName: name,
      note: `${input.verdict}: ${input.findings}`,
    })
    return correctionRepository.save(correction)
  },

  async publish(id: string, editor: ActingUser, input: PublishCorrectionInput) {
    const correction = await loadCorrection(id)
    assertStatus(
      correction,
      [CORRECTION_STATUSES.INVESTIGATING],
      'Only corrections under investigation can be published.',
    )

    const verdict = correction.investigation?.verdict
    if (verdict !== 'confirmed' && verdict !== 'partially-confirmed') {
      throw new AppError('Record findings that confirm the error before publishing a correction.', 400)
    }

    const publishedAt = new Date()
    const number = await articleRepository.addPublishedCorrection(
      correction.article.toString(),
      input.text,
      publishedAt,
    )
    if (number === null) {
      throw new AppError('The article for this correction no longer exists.', 404)
    }

    const name = await actorName(editor.id)
    correction.status = CORRECTION_STATUSES.PUBLISHED
    correction.publication = {
      number,
      text: input.text,
      publishedBy: new Types.ObjectId(editor.id),
      publishedByName: name,
      publishedAt,
    }
    pushHistory(correction, { action: 'published', by: editor.id, byName: name, note: input.text })
    const saved = await correctionRepository.save(correction)

    await notifyPublished(saved, editor, name)
    return saved
  },

  async dismiss(id: string, editor: ActingUser, input: DismissCorrectionInput) {
    const correction = await loadCorrection(id)
    assertStatus(
      correction,
      [CORRECTION_STATUSES.QUEUED, CORRECTION_STATUSES.INVESTIGATING],
      'Only open corrections can be dismissed.',
    )

    const name = await actorName(editor.id)
    correction.status = CORRECTION_STATUSES.DISMISSED
    correction.dismissal = {
      reason: input.reason,
      dismissedBy: new Types.ObjectId(editor.id),
      dismissedByName: name,
      dismissedAt: new Date(),
    }
    pushHistory(correction, { action: 'dismissed', by: editor.id, byName: name, note: input.reason })
    return correctionRepository.save(correction)
  },
}
