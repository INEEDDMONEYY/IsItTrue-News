
import { useMemo, useState } from 'react'
import { mockNotifications } from '@/features/notifications/data/mockNotifications'
import type {
  Notification,
  NotificationFilter,
  NotificationStats,
  NotificationType,
} from '@/features/notifications/types/notification.types'

export function useNotifications() {
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications)

  const [filter, setFilter] = useState<NotificationFilter>({
    type: 'all',
    read: 'all',
  })

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      const matchesType =
        filter.type === 'all' || notification.type === filter.type

      const matchesRead =
        filter.read === 'all' ||
        (filter.read === 'unread' && !notification.read) ||
        (filter.read === 'read' && notification.read)

      return matchesType && matchesRead
    })
  }, [notifications, filter])

  const stats = useMemo<NotificationStats>(() => {
    const total = notifications.length
    const unread = notifications.filter(
      (notification) => !notification.read,
    ).length

    return {
      total,
      unread,
      read: total - unread,
    }
  }, [notifications])

  const unreadNotifications = useMemo(
    () => notifications.filter((notification) => !notification.read),
    [notifications],
  )

  const markAsRead = (id: string) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? { ...notification, read: true }
          : notification,
      ),
    )
  }

  const markAsUnread = (id: string) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? { ...notification, read: false }
          : notification,
      ),
    )
  }

  const toggleReadStatus = (id: string) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? { ...notification, read: !notification.read }
          : notification,
      ),
    )
  }

  const markAllAsRead = () => {
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        read: true,
      })),
    )
  }

  const markAllAsUnread = () => {
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        read: false,
      })),
    )
  }

  const removeNotification = (id: string) => {
    setNotifications((current) =>
      current.filter((notification) => notification.id !== id),
    )
  }

  const removeReadNotifications = () => {
    setNotifications((current) =>
      current.filter((notification) => !notification.read),
    )
  }

  const setTypeFilter = (type: NotificationType | 'all') => {
    setFilter((current) => ({
      ...current,
      type,
    }))
  }

  const setReadFilter = (read: NotificationFilter['read']) => {
    setFilter((current) => ({
      ...current,
      read,
    }))
  }

  const resetFilters = () => {
    setFilter({
      type: 'all',
      read: 'all',
    })
  }

  return {
    notifications,
    filteredNotifications,
    unreadNotifications,
    stats,
    filter,

    markAsRead,
    markAsUnread,
    toggleReadStatus,
    markAllAsRead,
    markAllAsUnread,
    removeNotification,
    removeReadNotifications,

    setTypeFilter,
    setReadFilter,
    resetFilters,
  }
}

