import { Schema, model, Types, type HydratedDocument } from 'mongoose'

// One reader's visit to a published article. The visitor is a salted hash of IP and user agent that rotates every
// UTC day (see utils/visitorIdentity.ts), so the raw IP is never stored and visitors cannot be linked across days.
export interface IArticleView {
  article: Types.ObjectId
  visitorHash: string
  dayKey: string
  referrerHost?: string
  readingSeconds: number
  createdAt: Date
}

export type ArticleViewDocument = HydratedDocument<IArticleView>

export const MAX_READING_SECONDS = 1800

const articleViewSchema = new Schema<IArticleView>(
  {
    article: { type: Schema.Types.ObjectId, required: true },
    visitorHash: { type: String, required: true, maxlength: 64 },
    dayKey: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    referrerHost: { type: String, maxlength: 253 },
    readingSeconds: { type: Number, default: 0, min: 0, max: MAX_READING_SECONDS },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

articleViewSchema.index({ article: 1, createdAt: -1 })
articleViewSchema.index({ createdAt: -1 })

export const ArticleView = model<IArticleView>('ArticleView', articleViewSchema)
