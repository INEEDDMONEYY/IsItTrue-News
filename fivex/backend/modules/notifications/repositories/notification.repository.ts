import { Notification, type NotificationDocument } from '../models/Notification.js'
import type { NotificationAction, NotificationPriority, NotificationType } from '../models/Notification.js'

export interface CreateNotificationInput {
  recipient: string
  type: NotificationType
  title: string
  message: string
  priority?: NotificationPriority
  action?: NotificationAction
  actionLabel?: string
  href?: string
  relatedId?: string
  relatedType?: string
  actor?: { id: string; name: string }
}

export const notificationRepository = {
  async create(input: CreateNotificationInput): Promise<NotificationDocument> {
    return Notification.create(input)
  },

  async findById(id: string): Promise<NotificationDocument | null> {
    return Notification.findById(id)
  },

  async findByRecipient(recipientId: string): Promise<NotificationDocument[]> {
    return Notification.find({ recipient: recipientId }).sort({ createdAt: -1 })
  },

  async markRead(id: string, read: boolean): Promise<void> {
    await Notification.updateOne({ _id: id }, { $set: { read } })
  },

  async markAllRead(recipientId: string): Promise<void> {
    await Notification.updateMany({ recipient: recipientId, read: false }, { $set: { read: true } })
  },

  async deleteById(id: string): Promise<void> {
    await Notification.deleteOne({ _id: id })
  },

  async countUnread(recipientId: string): Promise<number> {
    return Notification.countDocuments({ recipient: recipientId, read: false })
  },
}
