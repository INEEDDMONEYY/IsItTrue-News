import { Schema, model, type HydratedDocument } from 'mongoose'
import { AUDIT_ACTOR_TYPES, AUDIT_CATEGORIES, AUDIT_OUTCOMES, AUDIT_SEVERITIES, type AuditActorType, type AuditCategory, type AuditOutcome, type AuditSeverity } from '../constants/auditCatalog.js'

export interface IAuditLog {
  eventType: string
  action: string
  description: string
  category: AuditCategory
  severity: AuditSeverity
  outcome: AuditOutcome
  actor: {
    id?: string
    type: AuditActorType
    name: string
    email?: string
    role?: string
  }
  resource?: {
    type: string
    id?: string
    title?: string
  }
  metadata?: Record<string, unknown>
  ipAddress?: string
  createdAt: Date
}

export type AuditLogDocument = HydratedDocument<IAuditLog>

const auditLogSchema = new Schema<IAuditLog>(
  {
    eventType: { type: String, required: true, index: true },
    action: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, enum: AUDIT_CATEGORIES, required: true, index: true },
    severity: { type: String, enum: AUDIT_SEVERITIES, required: true },
    outcome: { type: String, enum: AUDIT_OUTCOMES, required: true, index: true },
    actor: {
      id: { type: String, index: true },
      type: { type: String, enum: AUDIT_ACTOR_TYPES, required: true },
      name: { type: String, required: true },
      email: { type: String },
      role: { type: String },
    },
    resource: {
      type: { type: String },
      id: { type: String },
      title: { type: String },
    },
    metadata: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
    createdAt: { type: Date, required: true, default: () => new Date(), index: true },
  },
  {
    // Audit records are immutable: only inserts are allowed.
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = String(ret._id)
        delete ret._id
        delete ret.__v
        return ret
      },
    },
  },
)

const IMMUTABLE_OPERATIONS = /^(update|updateOne|updateMany|findOneAndUpdate|findOneAndReplace|replaceOne|delete|deleteOne|deleteMany|findOneAndDelete|findOneAndRemove|remove)$/

auditLogSchema.pre(IMMUTABLE_OPERATIONS, function () {
  throw new Error('Audit log entries are append-only and cannot be modified or deleted')
})

export const AuditLog = model<IAuditLog>('AuditLog', auditLogSchema)
