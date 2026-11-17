import { formatCount } from '../utils/formatters'

export interface BreakdownRow {
  key: string
  count: number
}

export function BreakdownTable({
  title,
  rows,
  emptyText,
  keyLabel = 'Value',
}: {
  title: string
  rows: BreakdownRow[]
  emptyText: string
  keyLabel?: string
}) {
  return (
    <section className="rounded-2xl border border-card-border bg-card p-5">
      <h2 className="mb-3 text-base font-semibold text-card-heading">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-card-text-muted">{emptyText}</p>
      ) : (
        <table className="min-w-full text-sm">
          <thead className="text-left text-card-text-muted">
            <tr>
              <th scope="col" className="py-2 font-medium">{keyLabel}</th>
              <th scope="col" className="py-2 font-medium">Count</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className="border-t border-card-border">
                <td className="py-2 text-card-heading">{row.key}</td>
                <td className="py-2">{formatCount(row.count)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}
