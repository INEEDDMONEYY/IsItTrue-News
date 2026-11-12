
import type { LucideIcon } from 'lucide-react'
import { ArrowUpRight } from 'lucide-react'

interface AdvertiserStatCardProps {
  label: string
  value: string
  description: string
  icon: LucideIcon
}

export function AdvertiserStatCard({
  label,
  value,
  description,
  icon: Icon,
}: AdvertiserStatCardProps) {
  return (
    <div className="min-w-0 rounded-2xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="break-words text-xs font-medium text-muted-foreground sm:text-sm">
            {label}
          </p>

          <p className="mt-2 break-words text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {value}
          </p>
        </div>

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:h-10 sm:w-10">
          <Icon className="h-[18px] w-[18px]" />
        </div>
      </div>

      <div className="mt-4 flex min-w-0 items-center gap-1.5">
        <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-primary" />
        <p className="min-w-0 break-words text-xs text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  )
}
