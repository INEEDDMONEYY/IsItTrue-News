import { Schema, model, Types, type HydratedDocument } from 'mongoose'

export const NOTIFICATION_TYPES = [
  'article',
  'editorial',
  'fact-check',
  'comment',
  'collaboration',
  'investigation',
  'source',
  'system',
] as const
export type NotificationType = (typeof NOTIFICATION_TYPES)[number]

export const NOTIFICATION_PRIORITIES = ['low', 'normal', 'high'] as const
export type NotificationPriority = (typeof NOTIFICATION_PRIORITIES)[number]

export const NOTIFICATION_ACTIONS = ['view', 'review', 'respond', 'open', 'manage'] as const
export type NotificationAction = (typeof NOTIFICATION_ACTIONS)[number]

export interface INotificationActor {
  id: Types.ObjectId
  name: string
}

export interface INotification {
  recipient: Types.ObjectId
  type: NotificationType
  title: string
  message: string
  read: boolean
  priority: NotificationPriority
  action?: NotificationAction
  actionLabel?: string
  href?: string
  relatedId?: string
  relatedType?: string
  actor?: INotificationActor
  createdAt: Date
  updatedAt: Date
}

export type NotificationDocument = HydratedDocument<INotification>

const notificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      required: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    message: { type: String, required: true, trim: true, maxlength: 500 },
    read: { type: Boolean, default: false },
    priority: {
      type: String,
      enum: NOTIFICATION_PRIORITIES,
      default: 'normal',
    },
    action: { type: String, enum: NOTIFICATION_ACTIONS },
    actionLabel: { type: String, trim: true, maxlength: 60 },
    href: { type: String, trim: true },
    relatedId: { type: String },
    relatedType: { type: String },
    actor: {
      type: new Schema(
        {
          id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
          name: { type: String, required: true },
        },
        { _id: false },
      ),
      required: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = String(ret._id)
        ret.timestamp = (ret.createdAt as Date)?.toISOString()
        delete ret._id
        delete ret.__v
        return ret
      },
    },
  },
)

notificationSchema.index({ recipient: 1, createdAt: -1 })
notificationSchema.index({ recipient: 1, read: 1 })

export const Notification = model<INotification>('Notification', notificationSchema)
