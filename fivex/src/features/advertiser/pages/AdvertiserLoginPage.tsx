
import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { useAdvertiserAuth } from '@/app/providers/AdvertiserAuthProvider'
import { advertiserApi } from '../api/advertiser.api'

export function AdvertiserLoginPage() {
  const { login } = useAdvertiserAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  // Set when the server refused the sign-in only because the email isn't verified yet.
  const [needsVerification, setNeedsVerification] = useState(false)
  const [resendState, setResendState] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [resendError, setResendError] = useState('')

  const redirectTo =
    location.state?.from?.pathname &&
    location.state.from.pathname.startsWith('/advertiser')
      ? location.state.from.pathname
      : '/advertiser'

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setNeedsVerification(false)
    setResendState('idle')
    setResendError('')

    if (!email.trim() || !password) {
      setError('Please enter your email and password.')
      return
    }

    try {
      setIsSubmitting(true)

      await login({ email, password })

      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to sign in. Please try again.'))
      setNeedsVerification(isAxiosError(err) && err.response?.status === 403 && /verify your email/i.test(getErrorMessage(err)))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResend = async () => {
    setResendState('sending')
    setResendError('')
    try {
      await advertiserApi.resendVerification(email)
      setResendState('sent')
    } catch (err) {
      setResendState('idle')
      setResendError(getErrorMessage(err, 'Could not send the email. Please try again.'))
    }
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
          <ShieldCheck className="h-5 w-5 text-zinc-300" />
        </div>

        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Advertiser access
        </p>

        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Welcome back
        </h1>

        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          Sign in to manage your advertising campaigns and business account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="advertiser-email"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            Business email
          </label>

          <input
            id="advertiser-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@company.com"
            className="w-full min-w-0 rounded-xl border border-white/10 bg-[#09090b] px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-white/30 focus:ring-2 focus:ring-white/5"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <label
              htmlFor="advertiser-password"
              className="text-sm font-medium text-zinc-300"
            >
              Password
            </label>

            <Link
              to="/advertiser/forgot-password"
              className="text-xs font-medium text-zinc-400 transition hover:text-white"
            >
              Forgot password?
            </Link>
          </div>

          <div className="relative">
            <input
              id="advertiser-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              className="w-full min-w-0 rounded-xl border border-white/10 bg-[#09090b] px-4 py-3 pr-12 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-white/30 focus:ring-2 focus:ring-white/5"
            />

            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-zinc-500 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-500/20 bg-red-500/[0.07] px-4 py-3 text-sm text-red-300"
          >
            {error}

            {needsVerification && (
              <div className="mt-2">
                {resendState === 'sent' ? (
                  <span className="text-emerald-300">
                    If that account is waiting for verification, a new email is on its way.
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendState === 'sending'}
                    className="font-semibold text-white underline underline-offset-2 transition hover:no-underline disabled:opacity-60"
                  >
                    {resendState === 'sending' ? 'Sending...' : 'Resend verification email'}
                  </button>
                )}
                {resendError && <p className="mt-1 text-red-300">{resendError}</p>}
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3.5 text-sm font-semibold text-black shadow-lg shadow-black/20 transition hover:bg-zinc-200 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? 'Signing in...' : 'Sign in'}

          {!isSubmitting && <ArrowRight className="h-4 w-4" />}
        </button>
      </form>

      <div className="my-7 border-t border-white/[0.08]" />

      <p className="text-center text-sm text-zinc-400">
        New to advertising with us?{' '}
        <Link
          to="/advertiser/register"
          className="font-semibold text-white transition hover:text-zinc-300"
        >
          Create an account
        </Link>
      </p>

      <p className="mt-7 text-center text-[11px] leading-relaxed text-zinc-600">
        By continuing, you agree to follow our advertiser policies and
        platform terms.
      </p>
    </div>
  )
}
