import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import dayjs from '@/lib/dayjs'
import type { EditorialOverviewResponse } from '../types/editorialAnalytics.types'

interface EditorialTrendChartProps {
  submissionsByDay: EditorialOverviewResponse['trends']['submissionsByDay']
  viewsByDay: EditorialOverviewResponse['trends']['viewsByDay']
}

// Days with no events are absent from the aggregation. For counts, that means a real zero, so the chart fills them in.
function mergeDays({ submissionsByDay, viewsByDay }: EditorialTrendChartProps) {
  const rows = new Map<string, { day: string; submitted: number; views: number; visitors: number }>()
  for (const row of submissionsByDay) {
    rows.set(row.day, { day: row.day, submitted: row.submitted, views: 0, visitors: 0 })
  }
  for (const row of viewsByDay) {
    const existing = rows.get(row.day) ?? { day: row.day, submitted: 0, views: 0, visitors: 0 }
    rows.set(row.day, { ...existing, views: row.views, visitors: row.visitors })
  }
  return [...rows.values()].sort((a, b) => a.day.localeCompare(b.day))
}

export function EditorialTrendChart(props: EditorialTrendChartProps) {
  const data = mergeDays(props)

  if (data.length === 0) {
    return <p className="flex h-[260px] items-center justify-center text-sm text-card-text-muted">No activity in this period.</p>
  }

  return (
    <div className="h-[260px]" role="img" aria-label="Line chart of daily submissions, views, and unique visitors">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -12 }}>
          <CartesianGrid vertical={false} stroke="var(--color-card-border)" />
          <XAxis dataKey="day" tickFormatter={(value: string) => dayjs(value).format('MMM D')} tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip labelFormatter={(value) => dayjs(String(value)).format('MMM D, YYYY')} />
          <Legend />
          <Line type="monotone" dataKey="submitted" name="Submitted" stroke="var(--color-accent)" dot={false} />
          <Line type="monotone" dataKey="views" name="Views" stroke="#64748b" dot={false} />
          <Line type="monotone" dataKey="visitors" name="Unique visitors" stroke="#0ea5e9" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
