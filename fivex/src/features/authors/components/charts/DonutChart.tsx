interface Slice {
  label: string
  value: number
  color: string
}

export function DonutChart({ slices, centerLabel }: { slices: Slice[]; centerLabel?: string }) {
  const total = slices.reduce((sum, s) => sum + s.value, 0) || 1
  const radius = 60
  const strokeWidth = 18
  const circumference = 2 * Math.PI * radius

  const segments = slices.reduce<Array<Slice & { dash: number; offset: number }>>((acc, slice) => {
    const dash = (slice.value / total) * circumference
    const previous = acc[acc.length - 1]
    const offset = previous ? previous.offset + previous.dash : 0
    return [...acc, { ...slice, dash, offset }]
  }, [])

  return (
    <div className="flex items-center gap-6">
      <div className="relative shrink-0 w-[150px] h-[150px]">
        <svg width="150" height="150" viewBox="0 0 150 150" className="-rotate-90">
          <circle cx="75" cy="75" r={radius} fill="none" stroke="var(--color-card-2)" strokeWidth={strokeWidth} />
          {segments.map((segment, i) => (
            <circle
              key={i}
              cx="75"
              cy="75"
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${segment.dash} ${circumference - segment.dash}`}
              strokeDashoffset={-segment.offset}
              strokeLinecap="round"
            />
          ))}
        </svg>
        {centerLabel && (
          <span className="absolute inset-0 flex items-center justify-center text-sm font-medium text-card-heading">
            {centerLabel}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {slices.map((slice) => (
          <div key={slice.label} className="flex items-center gap-2 text-sm">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: slice.color }} />
            <span className="text-card-text-muted capitalize">{slice.label}</span>
            <span className="text-card-heading font-medium ml-auto">
              {Math.round((slice.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}