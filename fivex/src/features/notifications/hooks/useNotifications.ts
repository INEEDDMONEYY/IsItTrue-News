
import { useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { notificationsApi } from '@/features/notifications/api/notifications.api'
import type {
  Notification,
  NotificationFilter,
  NotificationStats,
  NotificationType,
} from '@/features/notifications/types/notification.types'

export const NOTIFICATIONS_QUERY_KEY = ['notifications', 'mine'] as const

export function useNotifications() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: notificationsApi.listMine,
    // Picks up new editorial submissions without a manual refresh.
    refetchInterval: 30_000,
  })
  const notifications = useMemo(() => data ?? [], [data])

  // Updates the UI immediately; resyncs from the server if the request fails.
  const applyChange = (
    update: (current: Notification[]) => Notification[],
    request: Promise<unknown>,
  ) => {
    queryClient.setQueryData<Notification[]>(NOTIFICATIONS_QUERY_KEY, (current) => update(current ?? []))
    request.catch(() => queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY }))
  }

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
    applyChange(
      (current) =>
        current.map((notification) =>
          notification.id === id ? { ...notification, read: true } : notification,
        ),
      notificationsApi.markRead(id),
    )
  }

  const markAsUnread = (id: string) => {
    applyChange(
      (current) =>
        current.map((notification) =>
          notification.id === id ? { ...notification, read: false } : notification,
        ),
      notificationsApi.markUnread(id),
    )
  }

  const toggleReadStatus = (id: string) => {
    const target = notifications.find((notification) => notification.id === id)
    if (!target) return
    if (target.read) markAsUnread(id)
    else markAsRead(id)
  }

  const markAllAsRead = () => {
    applyChange(
      (current) => current.map((notification) => ({ ...notification, read: true })),
      notificationsApi.markAllRead(),
    )
  }

  const markAllAsUnread = () => {
    const readIds = notifications.filter((notification) => notification.read).map((n) => n.id)
    applyChange(
      (current) => current.map((notification) => ({ ...notification, read: false })),
      Promise.all(readIds.map((id) => notificationsApi.markUnread(id))),
    )
  }

  const removeNotification = (id: string) => {
    applyChange(
      (current) => current.filter((notification) => notification.id !== id),
      notificationsApi.remove(id),
    )
  }

  const removeReadNotifications = () => {
    const readIds = notifications.filter((notification) => notification.read).map((n) => n.id)
    applyChange(
      (current) => current.filter((notification) => !notification.read),
      Promise.all(readIds.map((id) => notificationsApi.remove(id))),
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
    isLoading,
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

