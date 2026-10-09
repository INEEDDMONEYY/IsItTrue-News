import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { KeyRound, Lock, LockOpen } from 'lucide-react'
import logo from '@/assets/icons/question-icon-removebg.png'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { prelaunchApi } from '../api/prelaunch.api'
import { grantPreLaunchAccess, hasPreLaunchAccess, revokePreLaunchAccess } from '../utils/access'

const fieldClass =
  'mt-1 block w-full rounded-xl border border-border bg-bg px-3.5 py-3 text-sm text-heading focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30'

export function DevAccessPage() {
  const [code, setCode] = useState('')
  const [storageError, setStorageError] = useState(false)
  // Read once: unlocking or locking reloads the page, so this never goes stale.
  const [unlocked] = useState(hasPreLaunchAccess)

  useEffect(() => {
    document.title = 'Team access — IsItTrue News'
    const robots = document.createElement('meta')
    robots.name = 'robots'
    robots.content = 'noindex, nofollow'
    document.head.appendChild(robots)
    return () => robots.remove()
  }, [])

  const mutation = useMutation({
    mutationFn: prelaunchApi.verifyAccessCode,
    onSuccess: () => {
      if (!grantPreLaunchAccess()) {
        setStorageError(true)
        return
      }
      window.location.assign('/')
    },
  })

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (mutation.isPending || !code) return
    setStorageError(false)
    mutation.mutate(code)
  }

  const lock = () => {
    revokePreLaunchAccess()
    window.location.assign('/')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-5 py-12 text-text">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <img src={logo} alt="" className="size-8" />
          <span className="text-base font-semibold text-heading">IsItTrue News</span>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6">
          {unlocked ? (
            <div className="text-center">
              <LockOpen aria-hidden="true" className="mx-auto size-6 text-verified" />
              <h1 className="mt-3 text-lg font-semibold text-heading">Preview unlocked</h1>
              <p className="mt-1 text-sm text-text-muted">
                This browser can see the full site. Visitors without access still only see the landing page.
              </p>
              <div className="mt-5 flex flex-col gap-2">
                <a
                  href="/"
                  className="rounded-xl bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-on-brand hover:opacity-90"
                >
                  Go to the site
                </a>
                <button
                  type="button"
                  onClick={lock}
                  className="rounded-xl border border-border px-4 py-2.5 text-sm text-text-muted hover:text-heading"
                >
                  Lock preview on this browser
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={submit}>
              <KeyRound aria-hidden="true" className="mx-auto size-6 text-accent" />
              <h1 className="mt-3 text-center text-lg font-semibold text-heading">Team access</h1>
              <p className="mt-1 text-center text-sm text-text-muted">
                Enter the access code to view the full site before launch.
              </p>

              <label className="mt-5 block text-xs font-medium text-text-muted">
                Access code
                <input
                  className={fieldClass}
                  type="password"
                  name="access-code"
                  autoComplete="off"
                  autoFocus
                  required
                  maxLength={200}
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                />
              </label>

              {mutation.isError && (
                <p role="alert" className="mt-3 text-sm text-disputed">
                  {getErrorMessage(mutation.error, 'We couldn’t check that code. Please try again.')}
                </p>
              )}
              {storageError && (
                <p role="alert" className="mt-3 text-sm text-disputed">
                  The code is right, but your browser is blocking storage, so access can’t be remembered. Allow site
                  data for this page and try again.
                </p>
              )}

              <button
                type="submit"
                disabled={mutation.isPending || !code}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-on-brand hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Lock aria-hidden="true" className="size-4" />
                {mutation.isPending ? 'Checking…' : 'Unlock preview'}
              </button>
            </form>
          )}
        </div>

        {!unlocked && (
          <p className="mt-4 text-center text-xs text-text-dim">
            <Link to="/" className="hover:text-text">
              Back to the landing page
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
