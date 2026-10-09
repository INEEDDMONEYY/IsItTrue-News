import { Schema, model, Types, type HydratedDocument } from 'mongoose'
import {
  ALL_INVESTIGATION_STATUSES,
  INVESTIGATION_STATUSES,
  type InvestigationStatus,
} from '../constants/investigationStatus.js'
import {
  INVESTIGATION_WORKFLOW_STAGES,
  type InvestigationWorkflowStage,
} from '../constants/editorialWorkflow.js'

export interface ITimelineEntry {
  _id: Types.ObjectId
  date: Date
  title: string
  description: string
  // 'internal' entries (raw leads, unverified notes) never leave the
  // author/editor workspace — only 'public' entries reach the reader-facing
  // Investigation Viewer, and even those are capped for free/anonymous readers.
  visibility: 'public' | 'internal'
}

export interface IEditorComment {
  _id: Types.ObjectId
  editor: Types.ObjectId
  message: string
  createdAt: Date
}

export interface IInvestigationComment {
  _id: Types.ObjectId
  user: Types.ObjectId
  content: string
  createdAt: Date
}

export interface IInvestigationBookmark {
  user: Types.ObjectId
  savedAt: Date
}

export interface IInvestigation {
  title: string
  subheadline?: string
  slug: string
  summary: string
  coverImage?: string
  category?: string
  author: Types.ObjectId
  collaborators: Types.ObjectId[]
  status: InvestigationStatus
  workflowStage?: InvestigationWorkflowStage
  editorialDeadline?: Date
  bodyHtml?: string
  timeline: ITimelineEntry[]
  // Author-only private notes — never serialized to readers, never even
  // sent to editors unless they open the workspace view directly.
  internalNotes?: string
  editorComments: IEditorComment[]
  rejectionReason?: string
  publishedAt?: Date
  followedBy: Types.ObjectId[]
  followersCount: number
  bookmarkedBy: IInvestigationBookmark[]
  bookmarksCount: number
  comments: IInvestigationComment[]
  viewsCount: number
  createdAt: Date
  updatedAt: Date
}

export type InvestigationDocument = HydratedDocument<IInvestigation>

const timelineEntrySchema = new Schema<ITimelineEntry>(
  {
    date: { type: Date, required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    visibility: { type: String, enum: ['public', 'internal'], default: 'internal' },
  },
  { timestamps: false },
)

const editorCommentSchema = new Schema<IEditorComment>(
  {
    editor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true },
)

const investigationCommentSchema = new Schema<IInvestigationComment>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, trim: true, maxlength: 2000 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true },
)

const investigationSchema = new Schema<IInvestigation>(
  {
    title: { type: String, required: true, trim: true, minlength: 1, maxlength: 200 },
    subheadline: { type: String, trim: true, maxlength: 300 },
    slug: { type: String, required: true, trim: true, lowercase: true, index: true },
    summary: { type: String, required: true, trim: true, maxlength: 800 },
    coverImage: { type: String },
    category: { type: String, trim: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    collaborators: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
    status: {
      type: String,
      enum: ALL_INVESTIGATION_STATUSES,
      default: INVESTIGATION_STATUSES.DRAFT,
    },
    workflowStage: { type: String, enum: INVESTIGATION_WORKFLOW_STAGES },
    editorialDeadline: { type: Date },
    bodyHtml: { type: String, default: '' },
    timeline: { type: [timelineEntrySchema], default: [] },
    internalNotes: { type: String, trim: true, maxlength: 10000 },
    editorComments: { type: [editorCommentSchema], default: [] },
    rejectionReason: { type: String, trim: true, maxlength: 500 },
    publishedAt: { type: Date },
    followedBy: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
    followersCount: { type: Number, default: 0, min: 0 },
    bookmarkedBy: {
      type: [
        new Schema(
          {
            user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
            savedAt: { type: Date, default: Date.now },
          },
          { _id: false },
        ),
      ],
      default: [],
    },
    bookmarksCount: { type: Number, default: 0, min: 0 },
    comments: { type: [investigationCommentSchema], default: [] },
    viewsCount: { type: Number, default: 0, min: 0 },
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

investigationSchema.index({ status: 1, publishedAt: -1 })
investigationSchema.index({ author: 1, createdAt: -1 })
investigationSchema.index({ status: 1, category: 1, publishedAt: -1 })

export const Investigation = model<IInvestigation>('Investigation', investigationSchema)
