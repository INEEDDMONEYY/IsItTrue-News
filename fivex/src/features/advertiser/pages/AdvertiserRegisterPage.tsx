
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight, Building2, MailCheck } from 'lucide-react'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { useAdvertiserAuth } from '@/app/providers/AdvertiserAuthProvider'
import { getPasswordProblem, PASSWORD_HINT } from '../utils/passwordRules'

export function AdvertiserRegisterPage() {
  const { register } = useAdvertiserAuth()

  const [businessName, setBusinessName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  // Set once the account exists; the address the confirmation email went to.
  const [registeredEmail, setRegisteredEmail] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (!businessName.trim() || !email.trim() || !password) {
      setError('Please complete all required fields.')
      return
    }

    const problem = getPasswordProblem(password)
    if (problem) {
      setError(problem)
      return
    }

    if (password !== confirmPassword) {
      setError('Your passwords do not match.')
      return
    }

    if (!acceptedTerms) {
      setError('Please accept the advertiser terms to continue.')
      return
    }

    try {
      setIsSubmitting(true)

      await register({
        businessName,
        email,
        password,
      })

      setRegisteredEmail(email.trim())
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to create your account. Please try again.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (registeredEmail) {
    return (
      <div className="w-full py-4 text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/[0.08]">
          <MailCheck className="h-7 w-7 text-emerald-400" />
        </div>

        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
          One more step
        </p>

        <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>

        <p className="mt-3 break-words text-sm leading-relaxed text-zinc-400">
          We sent a verification link to{' '}
          <span className="font-medium text-white">{registeredEmail}</span>. Open it to activate your advertiser
          account, then sign in.
        </p>

        <Link
          to="/advertiser/login"
          className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3.5 text-sm font-semibold text-black transition hover:bg-zinc-200"
        >
          Go to sign in
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="mb-7">
        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
          <Building2 className="h-5 w-5 text-zinc-300" />
        </div>

        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Business registration
        </p>

        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Advertise with us
        </h1>

        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          Create your business account and start building your advertising
          presence on Is It True.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="business-name"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            Business or organization name
          </label>

          <input
            id="business-name"
            type="text"
            autoComplete="organization"
            required
            maxLength={120}
            value={businessName}
            onChange={(event) => setBusinessName(event.target.value)}
            placeholder="Your business name"
            className="w-full min-w-0 rounded-xl border border-white/10 bg-[#09090b] px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-white/30 focus:ring-2 focus:ring-white/5"
          />
        </div>

        <div>
          <label
            htmlFor="business-email"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            Business email
          </label>

          <input
            id="business-email"
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
          <label
            htmlFor="register-password"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            Password
          </label>

          <div className="relative">
            <input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Create a strong password"
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

          <p className="mt-2 text-[11px] text-zinc-600">{PASSWORD_HINT}</p>
        </div>

        <div>
          <label
            htmlFor="confirm-password"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            Confirm password
          </label>

          <div className="relative">
            <input
              id="confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Re-enter your password"
              className="w-full min-w-0 rounded-xl border border-white/10 bg-[#09090b] px-4 py-3 pr-12 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-white/30 focus:ring-2 focus:ring-white/5"
            />

            <button
              type="button"
              onClick={() => setShowConfirmPassword((value) => !value)}
              aria-label={
                showConfirmPassword ? 'Hide password' : 'Show password'
              }
              aria-pressed={showConfirmPassword}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-zinc-500 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <label className="flex cursor-pointer items-start gap-3 py-2">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(event) => setAcceptedTerms(event.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-white"
          />

          <span className="text-xs leading-relaxed text-zinc-400">
            I agree to the advertiser terms and conditions and acknowledge
            the platform's advertising policies.
          </span>
        </label>

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
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3.5 text-sm font-semibold text-black shadow-lg shadow-black/20 transition hover:bg-zinc-200 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? 'Creating account...' : 'Create business account'}

          {!isSubmitting && <ArrowRight className="h-4 w-4" />}
        </button>
      </form>

      <div className="my-7 border-t border-white/[0.08]" />

      <p className="text-center text-sm text-zinc-400">
        Already registered?{' '}
        <Link
          to="/advertiser/login"
          className="font-semibold text-white transition hover:text-zinc-300"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
