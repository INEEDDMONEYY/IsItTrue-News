import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import dayjs from '@/lib/dayjs'

export interface ViewsByDayRow {
  day: string
  views: number
  visitors: number
}

// Days with no views are absent from the aggregation, which means a real zero for counts, so the chart fills them in.
export function ArticleViewsChart({ data }: { data: ViewsByDayRow[] }) {
  if (data.length === 0) {
    return <p className="flex h-[260px] items-center justify-center text-sm text-card-text-muted">No article views in this period.</p>
  }

  const sorted = [...data].sort((a, b) => a.day.localeCompare(b.day))

  return (
    <div className="h-[260px]" role="img" aria-label="Line chart of daily article views and unique visitors">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={sorted} margin={{ top: 4, right: 8, bottom: 0, left: -12 }}>
          <CartesianGrid vertical={false} stroke="var(--color-card-border)" />
          <XAxis dataKey="day" tickFormatter={(value: string) => dayjs(value).format('MMM D')} tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip labelFormatter={(value) => dayjs(String(value)).format('MMM D, YYYY')} />
          <Legend />
          <Line type="monotone" dataKey="views" name="Views" stroke="var(--color-accent)" dot={false} />
          <Line type="monotone" dataKey="visitors" name="Unique visitors" stroke="#0ea5e9" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
