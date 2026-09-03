import { Schema, model, type HydratedDocument, type Types } from 'mongoose'

export const TOPIC_SUBMISSION_STATUSES = ['pending', 'reviewed'] as const
export type TopicSubmissionStatus = (typeof TOPIC_SUBMISSION_STATUSES)[number]

export interface ITopicSubmission {
  title: string
  description: string
  category?: string
  submittedBy: Types.ObjectId
  status: TopicSubmissionStatus
  createdAt: Date
  updatedAt: Date
}

export type TopicSubmissionDocument = HydratedDocument<ITopicSubmission>

const topicSubmissionSchema = new Schema<ITopicSubmission>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 150,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 2000,
    },
    category: {
      type: String,
      trim: true,
      maxlength: 60,
    },
    submittedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: TOPIC_SUBMISSION_STATUSES,
      default: 'pending',
    },
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

export const TopicSubmission = model<ITopicSubmission>('TopicSubmission', topicSubmissionSchema)
