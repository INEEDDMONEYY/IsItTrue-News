const PRESETS = [
  { days: 7, label: '7 days' },
  { days: 30, label: '30 days' },
  { days: 90, label: '90 days' },
] as const

interface DateRangeSelectProps {
  value: number
  onChange: (days: number) => void
}

export function DateRangeSelect({ value, onChange }: DateRangeSelectProps) {
  return (
    <div className="inline-flex rounded-lg border border-card-border p-0.5" role="group" aria-label="Date range">
      {PRESETS.map((preset) => (
        <button
          key={preset.days}
          type="button"
          aria-pressed={value === preset.days}
          onClick={() => onChange(preset.days)}
          className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
            value === preset.days ? 'bg-accent text-white' : 'text-card-text-muted hover:text-card-heading'
          }`}
        >
          {preset.label}
        </button>
      ))}
    </div>
  )
}
