
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { advertiserApi } from '../api/advertiser.api'

export function AdvertiserForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    const normalizedEmail = email.trim()

    if (!normalizedEmail) {
      setError('Please enter your business email.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError('Please enter a valid email address.')
      return
    }

    try {
      setIsSubmitting(true)
      await advertiserApi.forgotPassword(normalizedEmail)
      setIsSubmitted(true)
    } catch (err) {
      setError(getErrorMessage(err, 'We could not send the email. Please try again.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full">
      {!isSubmitted ? (
        <>
          <div className="mb-8">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
              <Mail className="h-5 w-5 text-zinc-300" />
            </div>

            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Account recovery
            </p>

            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Forgot your password?
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              Enter the business email associated with your advertiser
              account and we'll send you a link to choose a new password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="recovery-email"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
                Business email
              </label>

              <input
                id="recovery-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
                className="w-full min-w-0 rounded-xl border border-white/10 bg-[#09090b] px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-white/30 focus:ring-2 focus:ring-white/5"
              />
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-500/20 bg-red-500/[0.07] px-4 py-3 text-sm text-red-300"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3.5 text-sm font-semibold text-black transition hover:bg-zinc-200 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Sending...' : 'Send reset link'}
            </button>
          </form>
        </>
      ) : (
        <div className="py-4 text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/[0.08]">
            <CheckCircle2 className="h-7 w-7 text-emerald-400" />
          </div>

          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Request received
          </p>

          <h1 className="text-2xl font-semibold tracking-tight">
            Check your email
          </h1>

          <p className="mt-3 break-words text-sm leading-relaxed text-zinc-400">
            If an advertiser account exists for{' '}
            <span className="font-medium text-white">{email.trim()}</span>, we
            have sent a link to reset its password.
          </p>

          <p className="mt-3 text-xs leading-relaxed text-zinc-500">
            The link works once and expires soon. Nothing arrived? Check your spam folder.
          </p>

          <button
            type="button"
            onClick={() => setIsSubmitted(false)}
            className="mt-6 text-sm font-medium text-zinc-300 transition hover:text-white"
          >
            Try another email
          </button>
        </div>
      )}

      <div className="my-7 border-t border-white/[0.08]" />

      <Link
        to="/advertiser/login"
        className="flex items-center justify-center gap-2 text-sm font-medium text-zinc-400 transition hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to sign in
      </Link>
    </div>
  )
}
