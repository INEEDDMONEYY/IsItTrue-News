import { BadgeCheck, ShieldCheck } from 'lucide-react'
import { useProfileIdentity } from '@/features/profile/hooks/useProfileIdentity'

/** The account's identity verification status, shown for every role. */
export function IdentityVerificationSection() {
  const { verification, isLoading, error } = useProfileIdentity()
  const isVerified = verification.status === 'verified'

  return (
    <section className="rounded-2xl border border-card-border bg-card p-5">
      <h2 className="text-sm font-semibold text-card-heading mb-1">Profile &amp; Identity Verification</h2>
      <p className="text-xs text-card-text-muted mb-4">
        Verification helps readers understand who is behind published reporting.
      </p>

      {isLoading ? (
        <div className="h-16 animate-pulse rounded-xl bg-card-2" />
      ) : error ? (
        <p role="alert" className="text-sm text-disputed">
          We could not load your verification details. Please try again later.
        </p>
      ) : (
        <div className="max-w-lg">
          <div className="flex items-start gap-4 rounded-xl border border-card-border bg-card-2 p-4">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                isVerified ? 'bg-verified/10 text-verified' : 'bg-accent-bg text-accent'
              }`}
            >
              {isVerified ? <BadgeCheck className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
            </div>

            <div>
              <h3 className="text-sm font-semibold text-card-heading">
                {isVerified ? 'Identity verified' : 'Identity verification pending'}
              </h3>
              <p className="mt-1 text-sm leading-6 text-card-text-muted">
                {isVerified
                  ? 'Your identity verification is complete.'
                  : 'Complete the verification process to establish a verified identity.'}
              </p>
              <p className="mt-2 text-xs font-medium uppercase tracking-wide text-card-text-dim">
                Status: <span className="capitalize">{verification.status}</span>
              </p>
            </div>
          </div>

          {!isVerified && (
            <button
              type="button"
              className="mt-4 rounded-xl bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-on-brand transition"
            >
              Start Verification
            </button>
          )}
        </div>
      )}
    </section>
  )
}
