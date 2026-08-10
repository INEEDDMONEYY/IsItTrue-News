import {
  Heart,
  MessageCircle,
  ThumbsDown,
} from 'lucide-react'
import type { CommentStats as CommentStatsData } from '../types/comment.types'

interface CommentStatsProps {
  stats: CommentStatsData
}

export function CommentStats({ stats }: CommentStatsProps) {
  const items = [
    {
      label: 'Comments',
      value: stats.total,
      icon: MessageCircle,
      iconClass: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Likes',
      value: stats.likes,
      icon: Heart,
      iconClass: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Dislikes',
      value: stats.dislikes,
      icon: ThumbsDown,
      iconClass: 'bg-red-50 text-red-600',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        const Icon = item.icon

        return (
          <div
            key={item.label}
            className="rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--color-card-text-muted)]">
                  {item.label}
                </p>

                <p className="mt-2 text-2xl font-bold text-[var(--color-card-heading)]">
                  {item.value}
                </p>
              </div>

              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.iconClass}`}
              >
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}