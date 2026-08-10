
export type NotificationType =
  | 'article'
  | 'editorial'
  | 'fact-check'
  | 'comment'
  | 'collaboration'
  | 'investigation'
  | 'source'
  | 'system'

export type NotificationPriority = 'low' | 'normal' | 'high'

export type NotificationAction =
  | 'view'
  | 'review'
  | 'respond'
  | 'open'
  | 'manage'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  timestamp: string
  read: boolean
  priority: NotificationPriority
  action?: NotificationAction
  actionLabel?: string
  href?: string
  relatedId?: string
  relatedType?: string
  actor?: {
    id: string
    name: string
    avatar?: string
  }
}

export interface NotificationFilter {
  type: NotificationType | 'all'
  read: 'all' | 'unread' | 'read'
}

export interface NotificationGroup {
  label: string
  notifications: Notification[]
}

export interface NotificationStats {
  total: number
  unread: number
  read: number
}

