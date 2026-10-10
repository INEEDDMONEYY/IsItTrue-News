export const PASSWORD_REQUIREMENTS = [
  { label: 'At least 8 characters', test: (password: string) => password.length >= 8 },
  { label: 'An uppercase letter', test: (password: string) => /[A-Z]/.test(password) },
  { label: 'A lowercase letter', test: (password: string) => /[a-z]/.test(password) },
  { label: 'A number', test: (password: string) => /[0-9]/.test(password) },
] as const

// Mirrors the backend's passwordSchema (backend/modules/auth/validations/auth.validation.ts), so people hear
// about a weak password before submitting rather than after. The server remains the source of truth.
export function getPasswordError(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters long.'
  if (password.length > 128) return 'Password is too long.'
  if (!/[a-z]/.test(password)) return 'Password must include a lowercase letter.'
  if (!/[A-Z]/.test(password)) return 'Password must include an uppercase letter.'
  if (!/[0-9]/.test(password)) return 'Password must include a number.'
  return null
}
