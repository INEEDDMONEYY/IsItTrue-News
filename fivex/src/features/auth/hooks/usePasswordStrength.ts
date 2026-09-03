export type PasswordStrengthLabel = 'Too weak' | 'Weak' | 'Fair' | 'Good' | 'Strong'

export interface PasswordStrengthResult {
  score: number
  label: PasswordStrengthLabel
}

const LABELS: PasswordStrengthLabel[] = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong']

// Mirrors the backend's registerSchema password rules (8+ chars, upper, lower,
// number) plus a couple of extra signals for a nicer strength meter.
export function usePasswordStrength(password: string): PasswordStrengthResult {
  let score = 0
  if (password.length >= 8) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  if (password.length >= 12) score++

  const clamped = Math.min(score, 4)
  return { score: clamped, label: LABELS[clamped] }
}
