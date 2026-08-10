import {
  Eye,
  FileVideo,
  Heart,
  MessageSquare,
  PlayCircle,
  Clock3,
} from 'lucide-react'

interface MyVideoStatsProps {
  stats: {
    total: number
    published: number
    underReview: number
    drafts: number
    totalViews: number
    totalLikes: number
    totalComments: number
  }
}

export function MyVideoStats({ stats }: MyVideoStatsProps) {
  const items = [
    {
      label: 'Total Videos',
      value: stats.total,
      icon: FileVideo,
    },
    {
      label: 'Published',
      value: stats.published,
      icon: PlayCircle,
    },
    {
      label: 'Under Review',
      value: stats.underReview,
      icon: Clock3,
    },
    {
      label: 'Drafts',
      value: stats.drafts,
      icon: FileVideo,
    },
    {
      label: 'Total Views',
      value: stats.totalViews.toLocaleString(),
      icon: Eye,
    },
    {
      label: 'Total Likes',
      value: stats.totalLikes.toLocaleString(),
      icon: Heart,
    },
    {
      label: 'Comments',
      value: stats.totalComments.toLocaleString(),
      icon: MessageSquare,
    },
  ]

  return (
    <section className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-7">
      {items.map((item) => {
        const Icon = item.icon

        return (
          <div
            key={item.label}
            className="rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-accent-bg)] text-[var(--color-accent)]">
              <Icon className="h-5 w-5" />
            </div>

            <p className="text-sm text-[var(--color-card-text-muted)]">
              {item.label}
            </p>

            <p className="mt-1 text-2xl font-bold text-[var(--color-card-heading)]">
              {item.value}
            </p>
          </div>
        )
      })}
    </section>
  )
}