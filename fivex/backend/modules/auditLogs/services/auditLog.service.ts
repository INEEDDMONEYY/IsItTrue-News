import { Types } from 'mongoose'
import { AppError } from '../../../shared/errors/AppError.js'
import { ROLES } from '../../../shared/constants/roles.js'
import { logger } from '../../../config/logger.js'
import { escapeRegex } from '../../../utils/escapeRegex.js'
import type { AuthenticatedUser } from '../../../middleware/authenticate.js'
import { userRepository } from '../../users/repositories/user.repository.js'
import { AUDIT_EVENTS, type AuditActorType, type AuditEventType, type AuditOutcome } from '../constants/auditCatalog.js'
import { AuditLog, type AuditLogDocument } from '../models/AuditLog.js'
import type { AuditLogListQuery } from '../validations/auditLog.validation.js'

export interface AuditActorInput {
  id?: string
  email?: string
  role?: string
  name?: string
}

export interface AuditRecordInput {
  eventType: AuditEventType
  outcome?: AuditOutcome
  actor?: AuditActorInput
  resource?: { type: string; id?: string; title?: string }
  description?: string
  metadata?: Record<string, unknown>
  ipAddress?: string
}

const DAY_MS = 24 * 60 * 60 * 1000

function actorTypeFor(role?: string): AuditActorType {
  if (role === ROLES.ADMIN) return 'admin'
  if (role === ROLES.EDITOR) return 'editor'
  if (role === ROLES.AUTHOR) return 'author'
  return 'user'
}

// Converts an authenticated request user into the actor shape used by record().
export function auditActor(user: AuthenticatedUser | undefined): AuditActorInput | undefined {
  if (!user) return undefined
  return { id: user.id, email: user.email, role: user.role }
}

// Maps a stored document to the shape the admin audit UI expects.
function toApiEvent(doc: AuditLogDocument) {
  return {
    id: String(doc._id),
    eventType: doc.eventType,
    action: doc.action,
    description: doc.description,
    category: doc.category,
    severity: doc.severity,
    outcome: doc.outcome,
    actor: {
      id: doc.actor.id ?? '',
      name: doc.actor.name,
      email: doc.actor.email ?? '',
      role: doc.actor.role ?? '',
      type: doc.actor.type,
    },
    resource: doc.resource?.type
      ? { id: doc.resource.id ?? '', type: doc.resource.type, title: doc.resource.title ?? '' }
      : undefined,
    metadata: doc.metadata ?? undefined,
    ipAddress: doc.ipAddress,
    createdAt: doc.createdAt.toISOString(),
  }
}

function buildFilter(query: AuditLogListQuery): Record<string, unknown> {
  const filter: Record<string, unknown> = {}

  if (query.category) filter.category = query.category
  if (query.severity) filter.severity = query.severity
  if (query.outcome) filter.outcome = query.outcome
  if (query.actorId) filter['actor.id'] = query.actorId

  if (query.startDate || query.endDate) {
    const createdAt: Record<string, Date> = {}
    if (query.startDate) createdAt.$gte = query.startDate
    if (query.endDate) createdAt.$lt = query.endDate
    filter.createdAt = createdAt
  }

  if (query.search) {
    const pattern = { $regex: escapeRegex(query.search), $options: 'i' }
    filter.$or = [
      { description: pattern },
      { eventType: pattern },
      { 'actor.name': pattern },
      { 'actor.email': pattern },
      { 'resource.title': pattern },
    ]
  }

  return filter
}

async function countBetween(from: Date, to: Date): Promise<number> {
  return AuditLog.countDocuments({ createdAt: { $gte: from, $lt: to } })
}

export const auditLogService = {
  // Fail-open: an audit write problem is logged but never fails the business request.
  async record(input: AuditRecordInput): Promise<void> {
    try {
      const definition = AUDIT_EVENTS[input.eventType]
      const actor = input.actor ?? {}
      const actorId = actor.id && Types.ObjectId.isValid(actor.id) ? actor.id : undefined

      let name = actor.name ?? actor.email ?? 'Unknown'
      let email = actor.email
      let role = actor.role

      if (actorId) {
        const account = await userRepository.findById(actorId)
        if (account) {
          name = account.name
          email = account.email
          role = account.role
        }
      }

      const resourceTitle = input.resource?.title
      const description =
        input.description ?? (resourceTitle ? `${definition.action}: ${resourceTitle}` : definition.action)

      await AuditLog.create({
        eventType: input.eventType,
        action: definition.action,
        description,
        category: definition.category,
        severity: definition.severity,
        outcome: input.outcome ?? 'success',
        actor: {
          id: actorId,
          type: actorId ? actorTypeFor(role) : 'anonymous',
          name,
          email,
          role,
        },
        resource: input.resource,
        metadata: input.metadata,
        ipAddress: input.ipAddress,
        createdAt: new Date(),
      })
    } catch (error) {
      logger.error('Failed to write audit log entry', {
        eventType: input.eventType,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  },

  async list(query: AuditLogListQuery) {
    const filter = buildFilter(query)
    const sort = { createdAt: query.sortOrder === 'oldest' ? 1 : -1, _id: query.sortOrder === 'oldest' ? 1 : -1 } as const
    const skip = (query.page - 1) * query.pageSize

    const [docs, total] = await Promise.all([
      AuditLog.find(filter).sort(sort).skip(skip).limit(query.pageSize),
      AuditLog.countDocuments(filter),
    ])

    return {
      data: docs.map(toApiEvent),
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize),
      },
    }
  },

  async getById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError('Audit log entry not found', 404)
    }
    const doc = await AuditLog.findById(id)
    if (!doc) {
      throw new AppError('Audit log entry not found', 404)
    }
    return toApiEvent(doc)
  },

  async summary() {
    const now = Date.now()
    const dayStart = new Date(now - DAY_MS)
    const previousDayStart = new Date(now - 2 * DAY_MS)
    const far = new Date(now + DAY_MS)

    const [totalEvents, eventsToday, adminActions, securityEvents, failedActions, recent, previous] = await Promise.all([
      AuditLog.countDocuments({}),
      AuditLog.countDocuments({ createdAt: { $gte: dayStart } }),
      AuditLog.countDocuments({ 'actor.type': 'admin' }),
      AuditLog.countDocuments({ $or: [{ category: 'authentication' }, { severity: 'critical' }] }),
      AuditLog.countDocuments({ outcome: { $ne: 'success' } }),
      countBetween(dayStart, far),
      countBetween(previousDayStart, dayStart),
    ])

    // Percent change in event volume: last 24h against the 24h before that.
    const changesSincePreviousPeriod =
      previous === 0 ? (recent > 0 ? 100 : 0) : Math.round(((recent - previous) / previous) * 1000) / 10

    return {
      totalEvents,
      eventsToday,
      adminActions,
      securityEvents,
      failedActions,
      changesSincePreviousPeriod,
    }
  },

  async actors() {
    const rows = await AuditLog.aggregate<{
      _id: string
      name: string
      email?: string
      role?: string
      type: AuditActorType
    }>([
      { $match: { 'actor.id': { $exists: true, $ne: null } } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$actor.id',
          name: { $first: '$actor.name' },
          email: { $first: '$actor.email' },
          role: { $first: '$actor.role' },
          type: { $first: '$actor.type' },
        },
      },
      { $sort: { name: 1 } },
      { $limit: 500 },
    ])

    return rows.map((row) => ({
      id: row._id,
      name: row.name,
      email: row.email ?? '',
      role: row.role ?? '',
      type: row.type,
    }))
  },
}
