import type { ConcludingAssessment } from '../types/factCheck.types'
import { ASSESSMENT_LABELS, ASSESSMENT_MEANINGS, CONCLUDING_ORDER } from '../utils/factCheckLabels'

interface VerdictSelectorProps {
  value: ConcludingAssessment
  onChange: (value: ConcludingAssessment) => void
  // Options that can't be chosen right now, with the reason shown beside them.
  unavailable?: Partial<Record<ConcludingAssessment, string>>
}

// Picks a conclusion. Each option says what it means, because "unverified" and "unable to verify" are honest
// outcomes in their own right and must not be chosen as a stand-in for "false".
export function VerdictSelector({ value, onChange, unavailable = {} }: VerdictSelectorProps) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1 text-xs font-medium text-card-text-muted">Conclusion</legend>
      {CONCLUDING_ORDER.map((option) => {
        const blocked = unavailable[option]
        const selected = value === option
        return (
          <label
            key={option}
            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm transition-colors ${
              selected ? 'border-accent bg-accent-bg' : 'border-card-border hover:border-accent-border'
            } ${blocked ? 'cursor-not-allowed opacity-60' : ''}`}
          >
            <input
              type="radio"
              name="assessment"
              value={option}
              checked={selected}
              disabled={Boolean(blocked)}
              onChange={() => onChange(option)}
              className="mt-0.5"
            />
            <span>
              <span className="block font-medium text-card-heading">{ASSESSMENT_LABELS[option]}</span>
              <span className="block text-xs text-card-text-muted">{blocked ?? ASSESSMENT_MEANINGS[option]}</span>
            </span>
          </label>
        )
      })}
    </fieldset>
  )
}
