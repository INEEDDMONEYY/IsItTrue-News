import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { advertiserApi } from '../api/advertiser.api'

type State = { kind: 'verifying' } | { kind: 'verified' } | { kind: 'failed'; message: string }

// Where the emailed "verify your email" link lands. The link works once, so the request is made exactly once
// per visit (even under React's development double-run), and the token is taken out of the address bar.
export function AdvertiserVerifyEmailPage() {
  const navigate = useNavigate()
  const [token] = useState(() => new URLSearchParams(window.location.search).get('token')?.trim() ?? '')
  const started = useRef(false)
  const [state, setState] = useState<State>(() =>
    token ? { kind: 'verifying' } : { kind: 'failed', message: "This verification link isn't complete." },
  )

  useEffect(() => {
    if (window.location.search) navigate('/advertiser/verify-email', { replace: true })
    if (!token || started.current) return
    started.current = true

    advertiserApi
      .verifyEmail(token)
      .then(() => setState({ kind: 'verified' }))
      .catch((error: unknown) =>
        setState({ kind: 'failed', message: getErrorMessage(error, 'We could not verify your email. Please try again.') }),
      )
  }, [navigate, token])

  if (state.kind === 'verifying') {
    return (
      <div className="w-full py-6 text-center" role="status">
        <Loader2 className="mx-auto mb-5 h-8 w-8 animate-spin text-zinc-300" />
        <h1 className="text-2xl font-semibold tracking-tight">Verifying your email...</h1>
      </div>
    )
  }

  if (state.kind === 'verified') {
    return (
      <div className="w-full py-4 text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/[0.08]">
          <CheckCircle2 className="h-7 w-7 text-emerald-400" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Email verified</h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          Your advertiser account is active. You can sign in now.
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

  return (
    <div className="w-full py-4 text-center">
      <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-red-500/20 bg-red-500/[0.08]">
        <XCircle className="h-7 w-7 text-red-400" />
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">We couldn&apos;t verify your email</h1>
      <p role="alert" className="mt-3 text-sm leading-relaxed text-zinc-400">
        {state.message}
      </p>
      <p className="mt-3 text-xs leading-relaxed text-zinc-500">
        Links expire and only work once. Sign in to request a new verification email.
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
