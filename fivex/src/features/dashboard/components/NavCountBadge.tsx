interface NavCountBadgeProps {
  count: number
  className?: string
}

// Renders nothing at zero, so the nav only shows badges for work that is waiting.
export function NavCountBadge({ count, className = 'bg-brand-gradient text-on-brand' }: NavCountBadgeProps) {
  if (count <= 0) return null
  return (
    <span
      className={`inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold leading-none ${className}`}
    >
      {count > 99 ? '99+' : count}
    </span>
  )
}
