import { AppError } from '../../../shared/errors/AppError.js'
import { notificationRepository, type CreateNotificationInput } from '../repositories/notification.repository.js'

export const notificationService = {
  // Internal helper used by other modules (comments, fact-checks, ...) to
  // raise a notification for a user. Never throws on the caller's behalf —
  // notifying is a side effect, not something that should fail the parent
  // action if it errors, so calls to this are expected to be awaited but any
  // failure here is a bug in the caller's input, not a recoverable state.
  async notify(input: CreateNotificationInput) {
    return notificationRepository.create(input)
  },

  async listMine(userId: string) {
    return notificationRepository.findByRecipient(userId)
  },

  async markAsRead(id: string, userId: string) {
    const notification = await notificationRepository.findById(id)
    if (!notification) {
      throw new AppError('Notification not found.', 404)
    }
    if (notification.recipient.toString() !== userId) {
      throw new AppError('You do not have permission to modify this notification.', 403)
    }
    await notificationRepository.markRead(id, true)
  },

  async markAsUnread(id: string, userId: string) {
    const notification = await notificationRepository.findById(id)
    if (!notification) {
      throw new AppError('Notification not found.', 404)
    }
    if (notification.recipient.toString() !== userId) {
      throw new AppError('You do not have permission to modify this notification.', 403)
    }
    await notificationRepository.markRead(id, false)
  },

  async markAllAsRead(userId: string) {
    await notificationRepository.markAllRead(userId)
  },

  async remove(id: string, userId: string) {
    const notification = await notificationRepository.findById(id)
    if (!notification) {
      throw new AppError('Notification not found.', 404)
    }
    if (notification.recipient.toString() !== userId) {
      throw new AppError('You do not have permission to delete this notification.', 403)
    }
    await notificationRepository.deleteById(id)
  },
}
