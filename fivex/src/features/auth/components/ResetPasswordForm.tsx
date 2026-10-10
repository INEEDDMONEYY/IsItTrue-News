import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { CheckCircle2 } from 'lucide-react'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { useResetPassword } from '../hooks/useResetPassword'
import { PASSWORD_REQUIREMENTS, getPasswordError } from '../utils/passwordRules'
import { PasswordStrength } from './PasswordStrength'

const inputClass =
  'w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg text-sm text-heading placeholder:text-text-dim focus:outline-none focus:ring-2 focus:ring-accent-border'

export function ResetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const { mutate, isPending, isSuccess, error } = useResetPassword()

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (isPending) return
    setValidationError(null)

    const passwordError = getPasswordError(password)
    if (passwordError) {
      setValidationError(passwordError)
      return
    }
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match.')
      return
    }

    mutate({ token, password })
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col gap-4">
        <div role="status" className="flex items-start gap-3 rounded-xl border border-verified/30 bg-verified/10 p-4">
          <CheckCircle2 aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-verified" />
          <div className="text-sm">
            <p className="font-semibold text-heading">Password updated</p>
            <p className="mt-1 text-text-muted">Your password has been changed. You can now sign in with it.</p>
          </div>
        </div>
        <Link
          to="/login"
          className="w-full py-2.5 rounded-xl bg-heading text-bg text-sm font-medium text-center hover:opacity-90 transition-opacity"
        >
          Sign in
        </Link>
      </div>
    )
  }

  // A 400 from this endpoint means the link itself is no good (used, expired, or replaced by a newer one).
  const linkRejected = isAxiosError(error) && error.response?.status === 400
  const fieldType = showPasswords ? 'text' : 'password'

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm text-text-muted mb-1.5" htmlFor="new-password">
          New password
        </label>
        <input
          id="new-password"
          type={fieldType}
          name="new-password"
          autoComplete="new-password"
          autoFocus
          required
          maxLength={128}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
          className={inputClass}
        />
        <PasswordStrength password={password} />
        <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs" aria-label="Password requirements">
          {PASSWORD_REQUIREMENTS.map(({ label, test }) => (
            <li key={label} className={test(password) ? 'text-verified' : 'text-text-dim'}>
              {test(password) ? '✓' : '•'} {label}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <label className="block text-sm text-text-muted mb-1.5" htmlFor="confirm-password">
          Confirm new password
        </label>
        <input
          id="confirm-password"
          type={fieldType}
          name="confirm-password"
          autoComplete="new-password"
          required
          maxLength={128}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="••••••••"
          className={inputClass}
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-text-muted">
        <input
          type="checkbox"
          checked={showPasswords}
          onChange={(event) => setShowPasswords(event.target.checked)}
          className="rounded border-border text-accent focus:ring-accent-border"
        />
        Show passwords
      </label>

      {(validationError || error) && (
        <p role="alert" className="text-sm text-disputed">
          {validationError ?? getErrorMessage(error, 'We couldn’t update your password. Please try again.')}
          {linkRejected && (
            <>
              {' '}
              <Link to="/forgot-password" className="text-accent font-medium hover:text-accent-hover">
                Request a new link
              </Link>
            </>
          )}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending || !password || !confirmPassword}
        className="w-full py-2.5 rounded-xl bg-heading text-bg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {isPending ? 'Updating...' : 'Update password'}
      </button>

      <p className="text-center text-sm text-text-muted">
        <Link to="/login" className="text-accent font-medium hover:text-accent-hover">
          Back to sign in
        </Link>
      </p>
    </form>
  )
}
