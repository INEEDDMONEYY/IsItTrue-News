// The same strength rules the server enforces, so mistakes are caught before a request is made.
export function getPasswordProblem(password: string): string | null {
  if (password.length < 8) return 'Your password must contain at least 8 characters.'
  if (!/[a-z]/.test(password)) return 'Your password must include a lowercase letter.'
  if (!/[A-Z]/.test(password)) return 'Your password must include an uppercase letter.'
  if (!/[0-9]/.test(password)) return 'Your password must include a number.'
  return null
}

export const PASSWORD_HINT = 'At least 8 characters, with a lowercase letter, an uppercase letter and a number.'
