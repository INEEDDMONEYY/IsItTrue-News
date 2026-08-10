import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'

interface RatioDonutCardProps {
  title: string
  primaryLabel: string
  primaryValue: number
  secondaryLabel: string
  secondaryValue: number
  color: string
}

/**
 * A "card circle" — a recharts donut showing a primary/secondary ratio
 * (e.g. verified vs unverified signups), with a legend beside it. Each
 * instance is given its own accent color so the four analytics ratios are
 * visually distinct at a glance.
 */
export function RatioDonutCard({
  title,
  primaryLabel,
  primaryValue,
  secondaryLabel,
  secondaryValue,
  color,
}: RatioDonutCardProps) {
  const total = primaryValue + secondaryValue
  const percentage = total ? Math.round((primaryValue / total) * 100) : 0
  const data = [
    { name: primaryLabel, value: primaryValue },
    { name: secondaryLabel, value: secondaryValue || 0.0001 },
  ]

  return (
    <div className="rounded-2xl border border-card-border bg-card p-5">
      <h2 className="text-sm font-semibold text-card-heading mb-4">{title}</h2>
      <div className="flex items-center gap-6">
        <div className="relative w-[140px] h-[140px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={45}
                outerRadius={65}
                startAngle={90}
                endAngle={-270}
                stroke="none"
              >
                <Cell fill={color} />
                <Cell fill="var(--color-card-2)" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <span className="absolute inset-0 flex items-center justify-center text-lg font-semibold text-card-heading">
            {percentage}%
          </span>
        </div>

        <div className="flex flex-col gap-2 text-sm min-w-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
            <span className="text-card-text-muted truncate">{primaryLabel}</span>
            <span className="text-card-heading font-medium ml-auto pl-2">
              {primaryValue.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-card-2" />
            <span className="text-card-text-muted truncate">{secondaryLabel}</span>
            <span className="text-card-heading font-medium ml-auto pl-2">
              {secondaryValue.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
