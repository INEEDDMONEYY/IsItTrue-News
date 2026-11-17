import type { AuthenticatedUser } from '../../../middleware/authenticate.js'
import { ARTICLE_STATUSES } from '../../articles/constants/articleStatus.js'
import { Article } from '../../articles/models/Article.js'
import { Claim } from '../../claims/models/Claim.js'
import { Correction } from '../../corrections/models/Correction.js'
import { Investigation } from '../../investigations/models/Investigation.js'
import { Notification } from '../../notifications/models/Notification.js'
import { ROLES } from '../../../shared/constants/roles.js'

export type DashboardNavCounts = Record<string, number>

const EDITOR_ROLES: string[] = [ROLES.EDITOR, ROLES.ADMIN]
const OPEN_CLAIM_STATUSES = ['unreviewed', 'returned', 'escalated']

// Keys are the sidebar `to` paths. Each count is an actionable queue, not a total.
// Zero counts are included so the client can hide them without guessing.
export const dashboardNavCountsService = {
  async forUser(user: AuthenticatedUser): Promise<DashboardNavCounts> {
    const unread = Notification.countDocuments({ recipient: user.id, read: false })

    if (EDITOR_ROLES.includes(user.role)) {
      const [notifications, review, approvals, factChecks, investigations, corrections] = await Promise.all([
        unread,
        Article.countDocuments({
          status: { $ne: ARTICLE_STATUSES.PUBLISHED },
          editorialStage: 'reviewing',
        }),
        Article.countDocuments({ status: ARTICLE_STATUSES.PENDING_REVIEW }),
        Claim.countDocuments({ workflowStatus: { $in: OPEN_CLAIM_STATUSES } }),
        Investigation.countDocuments({
          workflowStage: 'editorial_review',
          status: { $nin: ['published', 'rejected'] },
        }),
        Correction.countDocuments({ status: 'queued' }),
      ])
      return {
        '/dashboard': notifications,
        '/dashboard/review': review,
        '/dashboard/approvals': approvals,
        '/dashboard/fact-check-oversight': factChecks,
        '/dashboard/investigation-oversight': investigations,
        '/dashboard/corrections': corrections,
      }
    }

    if (user.role === ROLES.AUTHOR) {
      const [notifications, drafts] = await Promise.all([
        unread,
        Article.countDocuments({ author: user.id, status: ARTICLE_STATUSES.DRAFT }),
      ])
      return { '/dashboard': notifications, '/dashboard/drafts': drafts }
    }

    return { '/dashboard': await unread }
  },
}
