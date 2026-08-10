
import {
  BookOpen,
  FileCheck2,
  FileText,
  FolderSearch,
  Globe2,
  MessageSquare,
  Settings2,
  Users,
  type LucideIcon,
} from 'lucide-react'

import type { NotificationType } from '@/features/notifications/types/notification.types'

interface NotificationStatusBadgeProps {
  type: NotificationType
}

interface NotificationTypeConfig {
  label: string
  icon: LucideIcon
  className: string
}

const notificationTypeConfig: Record<
  NotificationType,
  NotificationTypeConfig
> = {
  article: {
    label: 'Article',
    icon: FileText,
    className:
      'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900',
  },
  editorial: {
    label: 'Editorial',
    icon: BookOpen,
    className:
      'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900',
  },
  'fact-check': {
    label: 'Fact Check',
    icon: FileCheck2,
    className:
      'bg-green-50 text-green-700 border-green-100 dark:bg-green-950/40 dark:text-green-300 dark:border-green-900',
  },
  comment: {
    label: 'Comment',
    icon: MessageSquare,
    className:
      'bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-900',
  },
  collaboration: {
    label: 'Collaboration',
    icon: Users,
    className:
      'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900',
  },
  investigation: {
    label: 'Investigation',
    icon: FolderSearch,
    className:
      'bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-900',
  },
  source: {
    label: 'Source',
    icon: Globe2,
    className:
      'bg-cyan-50 text-cyan-700 border-cyan-100 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-900',
  },
  system: {
    label: 'System',
    icon: Settings2,
    className:
      'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  },
}

export function NotificationStatusBadge({
  type,
}: NotificationStatusBadgeProps) {
  const config = notificationTypeConfig[type]
  const Icon = config.icon

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${config.className}`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {config.label}
    </span>
  )
}

