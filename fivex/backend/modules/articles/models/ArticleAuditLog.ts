import { Schema, model, Types, type HydratedDocument } from 'mongoose'
import { ALL_ARTICLE_STATUSES, type ArticleStatus } from '../constants/articleStatus.js'
import { ARTICLE_AUDIT_ACTIONS, type ArticleAuditAction } from '../constants/articleAudit.js'

// One line in an article's history. Entries are only ever added: nothing in the app updates or removes them.
// The title and the actor's name/role are copied in, so the record still reads correctly after the article is
// deleted or the person is renamed.
export interface IArticleAuditLog {
  article: Types.ObjectId
  articleTitle: string
  action: ArticleAuditAction
  actor: Types.ObjectId
  actorName: string
  actorRole: string
  fromStatus?: ArticleStatus
  toStatus?: ArticleStatus
  note?: string
  changedFields?: string[]
  createdAt: Date
}

export type ArticleAuditLogDocument = HydratedDocument<IArticleAuditLog>

const articleAuditLogSchema = new Schema<IArticleAuditLog>(
  {
    article: { type: Schema.Types.ObjectId, required: true },
    articleTitle: { type: String, required: true, trim: true, maxlength: 200 },
    action: { type: String, enum: ARTICLE_AUDIT_ACTIONS, required: true },
    actor: { type: Schema.Types.ObjectId, required: true },
    actorName: { type: String, required: true, trim: true, maxlength: 200 },
    actorRole: { type: String, required: true },
    fromStatus: { type: String, enum: ALL_ARTICLE_STATUSES },
    toStatus: { type: String, enum: ALL_ARTICLE_STATUSES },
    note: { type: String, trim: true, maxlength: 500 },
    changedFields: { type: [String], default: undefined },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = String(ret._id)
        ret.article = String(ret.article)
        ret.actor = String(ret.actor)
        delete ret._id
        delete ret.__v
        return ret
      },
    },
  },
)

articleAuditLogSchema.index({ article: 1, createdAt: -1 })

export const ArticleAuditLog = model<IArticleAuditLog>('ArticleAuditLog', articleAuditLogSchema)
