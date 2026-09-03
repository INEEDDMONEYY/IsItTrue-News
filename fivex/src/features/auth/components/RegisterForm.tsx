import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useRegister } from '../hooks/useRegister'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { PasswordStrength } from './PasswordStrength'
import { TermsCheckbox } from './TermsCheckbox'

export function RegisterForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const { mutate, isPending, isSuccess, error } = useRegister()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setValidationError(null)

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match.')
      return
    }

    mutate({ name, email, password })
  }

  if (isSuccess) {
    return (
      <div className="rounded-xl border border-verified/30 bg-verified/10 px-4 py-3 text-sm text-heading">
        Account created! Check your email to verify your address, then{' '}
        <Link to="/login" className="text-accent font-medium hover:text-accent-hover">
          sign in
        </Link>
        .
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm text-text-muted mb-1.5" htmlFor="name">
          Full name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Jane Doe"
          className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg text-sm text-heading placeholder:text-text-dim focus:outline-none focus:ring-2 focus:ring-accent-border"
        />
      </div>

      <div>
        <label className="block text-sm text-text-muted mb-1.5" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
          className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg text-sm text-heading placeholder:text-text-dim focus:outline-none focus:ring-2 focus:ring-accent-border"
        />
      </div>

      <div>
        <label className="block text-sm text-text-muted mb-1.5" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          placeholder="••••••••"
          className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg text-sm text-heading placeholder:text-text-dim focus:outline-none focus:ring-2 focus:ring-accent-border"
        />
        <PasswordStrength password={password} />
      </div>

      <div>
        <label className="block text-sm text-text-muted mb-1.5" htmlFor="confirmPassword">
          Confirm password
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          placeholder="••••••••"
          className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg text-sm text-heading placeholder:text-text-dim focus:outline-none focus:ring-2 focus:ring-accent-border"
        />
      </div>

      <TermsCheckbox checked={agreedToTerms} onChange={setAgreedToTerms} />

      {(validationError || error) && (
        <p className="text-sm text-disputed">{validationError ?? getErrorMessage(error)}</p>
      )}

      <button
        type="submit"
        disabled={isPending || !agreedToTerms}
        className="w-full py-2.5 rounded-xl bg-heading text-bg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? 'Creating account...' : 'Create account'}
      </button>
    </form>
  )
}
