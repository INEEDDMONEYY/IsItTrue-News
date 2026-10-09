import { Schema, model, Types, type HydratedDocument } from 'mongoose'
import {
  ALL_CORRECTION_STATUSES,
  CORRECTION_CATEGORIES,
  CORRECTION_HISTORY_ACTIONS,
  CORRECTION_STATUSES,
  INVESTIGATION_VERDICTS,
  type CorrectionCategory,
  type CorrectionHistoryAction,
  type CorrectionStatus,
  type InvestigationVerdict,
} from '../constants/correctionStatus.js'

// Append-only audit trail: entries are only ever pushed, never edited or removed.
export interface ICorrectionHistoryEntry {
  action: CorrectionHistoryAction
  by: Types.ObjectId
  byName: string
  at: Date
  note?: string
}

export interface ICorrectionInvestigation {
  investigator: Types.ObjectId
  investigatorName: string
  startedAt: Date
  findings?: string
  verdict?: InvestigationVerdict
}

export interface ICorrectionPublication {
  number: number
  text: string
  publishedBy: Types.ObjectId
  publishedByName: string
  publishedAt: Date
}

export interface ICorrectionDismissal {
  reason: string
  dismissedBy: Types.ObjectId
  dismissedByName: string
  dismissedAt: Date
}

export interface ICorrection {
  article: Types.ObjectId
  // Snapshots, so the record stays meaningful even if the article is later removed.
  articleTitle: string
  articleSlug: string
  status: CorrectionStatus
  category: CorrectionCategory
  description: string
  suggestedFix?: string
  evidenceLinks: string[]
  reportedBy: Types.ObjectId
  reportedByName: string
  investigation?: ICorrectionInvestigation
  publication?: ICorrectionPublication
  dismissal?: ICorrectionDismissal
  history: ICorrectionHistoryEntry[]
  createdAt: Date
  updatedAt: Date
}

export type CorrectionDocument = HydratedDocument<ICorrection>

const historySchema = new Schema<ICorrectionHistoryEntry>(
  {
    action: { type: String, enum: CORRECTION_HISTORY_ACTIONS, required: true },
    by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    byName: { type: String, required: true },
    at: { type: Date, required: true, default: Date.now },
    note: { type: String, trim: true, maxlength: 4000 },
  },
  { _id: false },
)

const correctionSchema = new Schema<ICorrection>(
  {
    article: { type: Schema.Types.ObjectId, ref: 'Article', required: true, index: true },
    articleTitle: { type: String, required: true },
    articleSlug: { type: String, required: true },
    status: {
      type: String,
      enum: ALL_CORRECTION_STATUSES,
      default: CORRECTION_STATUSES.QUEUED,
    },
    category: { type: String, enum: CORRECTION_CATEGORIES, required: true },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    suggestedFix: { type: String, trim: true, maxlength: 2000 },
    evidenceLinks: { type: [String], default: [] },
    reportedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reportedByName: { type: String, required: true },
    investigation: {
      type: new Schema<ICorrectionInvestigation>(
        {
          investigator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
          investigatorName: { type: String, required: true },
          startedAt: { type: Date, required: true },
          findings: { type: String, trim: true, maxlength: 4000 },
          verdict: { type: String, enum: INVESTIGATION_VERDICTS },
        },
        { _id: false },
      ),
      default: undefined,
    },
    publication: {
      type: new Schema<ICorrectionPublication>(
        {
          number: { type: Number, required: true },
          text: { type: String, required: true, trim: true, maxlength: 1000 },
          publishedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
          publishedByName: { type: String, required: true },
          publishedAt: { type: Date, required: true },
        },
        { _id: false },
      ),
      default: undefined,
    },
    dismissal: {
      type: new Schema<ICorrectionDismissal>(
        {
          reason: { type: String, required: true, trim: true, maxlength: 500 },
          dismissedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
          dismissedByName: { type: String, required: true },
          dismissedAt: { type: Date, required: true },
        },
        { _id: false },
      ),
      default: undefined,
    },
    history: { type: [historySchema], default: [] },
  },
  {
    timestamps: true,
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

correctionSchema.index({ status: 1, updatedAt: -1 })

export const Correction = model<ICorrection>('Correction', correctionSchema)
