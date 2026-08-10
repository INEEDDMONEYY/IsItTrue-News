import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useLogin } from '../hooks/useLogin'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const { mutate, isPending, error } = useLogin()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    mutate({ email, password, rememberMe })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm text-text-muted" htmlFor="password">
            Password
          </label>
          <Link to="/forgot-password" className="text-xs text-accent hover:text-accent-hover">
            Forgot password?
          </Link>
        </div>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="••••••••"
          className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg text-sm text-heading placeholder:text-text-dim focus:outline-none focus:ring-2 focus:ring-accent-border"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-text-muted">
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="rounded border-border text-accent focus:ring-accent-border"
        />
        Remember me for 30 days
      </label>

      {error && (
        <p className="text-sm text-disputed">
          {error instanceof Error ? error.message : 'Something went wrong. Please try again.'}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-2.5 rounded-xl bg-heading text-bg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {isPending ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  )
}