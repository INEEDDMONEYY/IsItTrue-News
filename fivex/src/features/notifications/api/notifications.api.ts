import { apiClient } from '@/api/client'
import type { Notification } from '../types/notification.types'

export const notificationsApi = {
  listMine: async (): Promise<Notification[]> => {
    const { data } = await apiClient.get<{ notifications: Notification[] }>('/api/notifications/mine')
    return data.notifications
  },

  markRead: async (id: string): Promise<void> => {
    await apiClient.patch(`/api/notifications/${id}/read`)
  },

  markUnread: async (id: string): Promise<void> => {
    await apiClient.patch(`/api/notifications/${id}/unread`)
  },

  markAllRead: async (): Promise<void> => {
    await apiClient.patch('/api/notifications/read-all')
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/notifications/${id}`)
  },
}
