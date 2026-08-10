interface Point {
  label: string
  value: number
}

export function ViewsTrendChart({ data }: { data: Point[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-card-text-muted">No data yet.</p>
  }

  const width = 600
  const height = 180
  const padding = 24
  const max = Math.max(...data.map((d) => d.value), 1)

  const points = data.map((d, i) => {
    const x = padding + (i / Math.max(data.length - 1, 1)) * (width - padding * 2)
    const y = height - padding - (d.value / max) * (height - padding * 2)
    return { x, y, ...d }
  })

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      <defs>
        <linearGradient id="viewsLine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--color-chart-purple)" />
          <stop offset="100%" stopColor="var(--color-chart-cyan)" />
        </linearGradient>
        <linearGradient id="viewsArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-chart-cyan)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--color-chart-cyan)" stopOpacity="0" />
        </linearGradient>
      </defs>

      <path d={areaPath} fill="url(#viewsArea)" />
      <path d={linePath} fill="none" stroke="url(#viewsLine)" strokeWidth="2.5" />

      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="var(--color-chart-cyan)" />
      ))}
    </svg>
  )
}