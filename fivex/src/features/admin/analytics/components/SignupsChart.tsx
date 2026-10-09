import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import dayjs from '@/lib/dayjs'

interface SignupsChartProps {
  data: Array<{ date: string; count: number }>
}

/** Daily waitlist signups for the last 30 days (UTC days), one bar per day. */
export function SignupsChart({ data }: SignupsChartProps) {
  const total = data.reduce((sum, day) => sum + day.count, 0)

  return (
    <div className="rounded-2xl border border-card-border bg-card p-5">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-semibold text-card-heading">Daily sign-ups</h2>
        <span className="text-xs text-card-text-dim">Last 30 days · {total.toLocaleString()} total</span>
      </div>

      {total === 0 ? (
        <p className="flex h-[220px] items-center justify-center text-sm text-card-text-muted">
          No sign-ups in the last 30 days yet.
        </p>
      ) : (
        <div className="h-[220px]" role="img" aria-label={`Bar chart of daily waitlist sign-ups, ${total} in the last 30 days`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid vertical={false} stroke="var(--color-card-border)" />
              <XAxis
                dataKey="date"
                tickFormatter={(value: string) => dayjs(value).format('MMM D')}
                tick={{ fontSize: 11, fill: 'var(--color-card-text-dim)' }}
                tickLine={false}
                axisLine={false}
                minTickGap={24}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: 'var(--color-card-text-dim)' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ fill: 'var(--color-card-2)' }}
                labelFormatter={(value) => dayjs(String(value)).format('ddd, MMM D')}
                formatter={(value) => [String(value), 'Sign-ups']}
                contentStyle={{
                  background: 'var(--color-card)',
                  border: '1px solid var(--color-card-border)',
                  borderRadius: 12,
                  fontSize: 12,
                  color: 'var(--color-card-heading)',
                }}
              />
              <Bar dataKey="count" fill="var(--color-chart-pink)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
