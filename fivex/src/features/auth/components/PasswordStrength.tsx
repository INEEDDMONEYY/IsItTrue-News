import { usePasswordStrength } from '../hooks/usePasswordStrength'

const BAR_COLORS = ['bg-disputed', 'bg-disputed', 'bg-pending', 'bg-accent', 'bg-verified']

export function PasswordStrength({ password }: { password: string }) {
  if (!password) return null

  const { score, label } = usePasswordStrength(password)

  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((step) => (
          <span
            key={step}
            className={`h-1 flex-1 rounded-full transition-colors ${
              step <= score ? BAR_COLORS[score] : 'bg-border'
            }`}
          />
        ))}
      </div>
      <p className="mt-1 text-xs text-text-muted">{label}</p>
    </div>
  )
}
