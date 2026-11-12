
import type { ReactNode } from 'react'

interface AdvertiserPageHeaderProps {
  title: string
  description?: string
  children?: ReactNode
}

export function AdvertiserPageHeader({
  title,
  description,
  children,
}: AdvertiserPageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl lg:text-3xl">
          {title}
        </h1>

        {description && (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {description}
          </p>
        )}
      </div>

      {children && (
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:shrink-0">
          {children}
        </div>
      )}
    </div>
  )
}
