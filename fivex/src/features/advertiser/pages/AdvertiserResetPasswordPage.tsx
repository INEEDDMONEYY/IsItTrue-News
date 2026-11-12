import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { ArrowRight, CheckCircle2, Eye, EyeOff, KeyRound } from 'lucide-react'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { advertiserApi } from '../api/advertiser.api'
import { getPasswordProblem, PASSWORD_HINT } from '../utils/passwordRules'

const inputClass =
  'w-full min-w-0 rounded-xl border border-white/10 bg-[#09090b] px-4 py-3 pr-12 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-white/30 focus:ring-2 focus:ring-white/5'

// Where the emailed "reset your password" link lands. The token is a secret, so it is read once, kept in memory
// only and removed from the address bar; a reload needs the emailed link again.
export function AdvertiserResetPasswordPage() {
  const navigate = useNavigate()
  const [token] = useState(() => new URLSearchParams(window.location.search).get('token')?.trim() ?? '')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  // The server said the link itself is no good (used, expired, or replaced by a newer one).
  const [linkRejected, setLinkRejected] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (window.location.search) navigate('/advertiser/reset-password', { replace: true })

    // Never send this page's address to other sites, and keep it out of search results.
    const tags = [
      { name: 'referrer', content: 'no-referrer' },
      { name: 'robots', content: 'noindex, nofollow' },
    ].map(({ name, content }) => {
      const tag = document.createElement('meta')
      tag.name = name
      tag.content = content
      document.head.appendChild(tag)
      return tag
    })
    return () => tags.forEach((tag) => tag.remove())
  }, [navigate])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting) return
    setError('')

    const problem = getPasswordProblem(password)
    if (problem) {
      setError(problem)
      return
    }
    if (password !== confirmPassword) {
      setError('Your passwords do not match.')
      return
    }

    try {
      setIsSubmitting(true)
      await advertiserApi.resetPassword(token, password)
      setDone(true)
    } catch (err) {
      setLinkRejected(isAxiosError(err) && err.response?.status === 400 && /reset link/i.test(getErrorMessage(err)))
      setError(getErrorMessage(err, 'We could not update your password. Please try again.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="w-full py-4 text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/[0.08]">
          <CheckCircle2 className="h-7 w-7 text-emerald-400" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Password updated</h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          Your password has been changed and any signed-in devices were signed out. Sign in with the new one.
        </p>
        <Link
          to="/advertiser/login"
          className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3.5 text-sm font-semibold text-black transition hover:bg-zinc-200"
        >
          Sign in
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    )
  }

  if (!token || linkRejected) {
    return (
      <div className="w-full py-4 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {token ? 'This reset link no longer works' : "This reset link isn't complete"}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          {token
            ? 'It may have expired or already been used. Request a new one to continue.'
            : 'Open the link from your password reset email again, or request a new one.'}
        </p>
        <Link
          to="/advertiser/forgot-password"
          className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3.5 text-sm font-semibold text-black transition hover:bg-zinc-200"
        >
          Request a new link
        </Link>
      </div>
    )
  }

  const fieldType = showPasswords ? 'text' : 'password'

  return (
    <div className="w-full">
      <div className="mb-8">
        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
          <KeyRound className="h-5 w-5 text-zinc-300" />
        </div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Account recovery</p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Choose a new password</h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">Pick something you don&apos;t use anywhere else.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="advertiser-new-password" className="mb-2 block text-sm font-medium text-zinc-300">
            New password
          </label>
          <div className="relative">
            <input
              id="advertiser-new-password"
              type={fieldType}
              autoComplete="new-password"
              autoFocus
              required
              maxLength={128}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => setShowPasswords((value) => !value)}
              aria-label={showPasswords ? 'Hide passwords' : 'Show passwords'}
              aria-pressed={showPasswords}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-zinc-500 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            >
              {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="mt-2 text-[11px] text-zinc-600">{PASSWORD_HINT}</p>
        </div>

        <div>
          <label htmlFor="advertiser-confirm-new-password" className="mb-2 block text-sm font-medium text-zinc-300">
            Confirm new password
          </label>
          <input
            id="advertiser-confirm-new-password"
            type={fieldType}
            autoComplete="new-password"
            required
            maxLength={128}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className={inputClass}
          />
        </div>

        {error && (
          <div role="alert" className="rounded-xl border border-red-500/20 bg-red-500/[0.07] px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3.5 text-sm font-semibold text-black shadow-lg shadow-black/20 transition hover:bg-zinc-200 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? 'Updating...' : 'Update password'}
        </button>
      </form>

      <div className="my-7 border-t border-white/[0.08]" />
      <Link to="/advertiser/login" className="block text-center text-sm font-medium text-zinc-400 transition hover:text-white">
        Back to sign in
      </Link>
    </div>
  )
}
