import { Link } from 'react-router-dom'

interface TermsCheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
}

export function TermsCheckbox({ checked, onChange }: TermsCheckboxProps) {
  return (
    <label className="flex items-start gap-2 text-sm text-text-muted">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        required
        className="mt-0.5 rounded border-border text-accent focus:ring-accent-border"
      />
      <span>
        I agree to the{' '}
        <Link to="/terms-of-service" className="text-accent hover:text-accent-hover">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link to="/privacy-policy" className="text-accent hover:text-accent-hover">
          Privacy Policy
        </Link>
      </span>
    </label>
  )
}
