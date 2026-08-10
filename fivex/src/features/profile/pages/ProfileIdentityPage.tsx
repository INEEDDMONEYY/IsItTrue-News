
import {
  BadgeCheck,
  FileCheck2,
  ShieldCheck,
  UserRound,
} from 'lucide-react'

import { useProfileIdentity } from '@/features/profile/hooks/useProfileIdentity'

export function ProfileIdentityPage() {
  const {
    profile,
    verification,
    isLoading,
    error,
  } = useProfileIdentity()

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-[var(--color-surface-2)]" />
        <div className="h-4 w-96 max-w-full animate-pulse rounded bg-[var(--color-surface-2)]" />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="h-64 animate-pulse rounded-2xl bg-[var(--color-surface-2)] lg:col-span-2" />
          <div className="h-64 animate-pulse rounded-2xl bg-[var(--color-surface-2)]" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-6xl">
        <div className="rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] p-8 text-center shadow-sm">
          <ShieldCheck className="mx-auto mb-4 h-10 w-10 text-[var(--color-disputed)]" />

          <h1 className="text-xl font-semibold text-[var(--color-card-heading)]">
            Unable to load your profile
          </h1>

          <p className="mt-2 text-sm text-[var(--color-card-text-muted)]">
            We could not load your profile and identity verification details.
            Please try again later.
          </p>
        </div>
      </div>
    )
  }

  const isVerified = verification?.status === 'verified'

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-accent-bg)] text-[var(--color-accent)]">
            <UserRound className="h-5 w-5" />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--color-heading)]">
              Profile & Identity Verification
            </h1>

            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Manage your author profile and verify your identity.
            </p>
          </div>
        </div>
      </div>

      {/* Verification Summary */}
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-accent-bg)] text-[var(--color-accent)]">
              <UserRound className="h-5 w-5" />
            </div>

            <span className="text-xs font-medium uppercase tracking-wide text-[var(--color-card-text-dim)]">
              Profile
            </span>
          </div>

          <p className="text-sm font-medium text-[var(--color-card-heading)]">
            {profile?.displayName || 'Author Profile'}
          </p>

          <p className="mt-1 text-sm text-[var(--color-card-text-muted)]">
            Your public author identity
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-accent-bg)] text-[var(--color-accent)]">
              <BadgeCheck className="h-5 w-5" />
            </div>

            <span className="text-xs font-medium uppercase tracking-wide text-[var(--color-card-text-dim)]">
              Identity
            </span>
          </div>

          <p className="text-sm font-medium text-[var(--color-card-heading)]">
            {isVerified ? 'Verified' : 'Verification required'}
          </p>

          <p className="mt-1 text-sm text-[var(--color-card-text-muted)]">
            {isVerified
              ? 'Your identity has been verified.'
              : 'Complete verification to strengthen your author profile.'}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-accent-bg)] text-[var(--color-accent)]">
              <FileCheck2 className="h-5 w-5" />
            </div>

            <span className="text-xs font-medium uppercase tracking-wide text-[var(--color-card-text-dim)]">
              Status
            </span>
          </div>

          <p className="text-sm font-medium capitalize text-[var(--color-card-heading)]">
            {verification?.status || 'Pending'}
          </p>

          <p className="mt-1 text-sm text-[var(--color-card-text-muted)]">
            Current verification status
          </p>
        </div>
      </section>

      {/* Profile and Verification Content */}
      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-[var(--color-card-heading)]">
              Author Profile
            </h2>

            <p className="mt-1 text-sm text-[var(--color-card-text-muted)]">
              Information displayed with your published work.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-card-text-dim)]">
                Display Name
              </p>

              <p className="mt-1 text-sm text-[var(--color-card-text)]">
                {profile?.displayName || 'Not provided'}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-card-text-dim)]">
                Bio
              </p>

              <p className="mt-1 text-sm leading-6 text-[var(--color-card-text)]">
                {profile?.bio || 'No author biography has been added yet.'}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-card-text-dim)]">
                Author Status
              </p>

              <p className="mt-1 text-sm text-[var(--color-card-text)]">
                {profile?.status || 'Active'}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-[var(--color-card-heading)]">
              Identity Verification
            </h2>

            <p className="mt-1 text-sm text-[var(--color-card-text-muted)]">
              Verification helps readers understand who is behind published
              reporting.
            </p>
          </div>

          <div className="rounded-xl border border-[var(--color-card-border)] bg-[var(--color-card-2)] p-5">
            <div className="flex items-start gap-4">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  isVerified
                    ? 'bg-[rgba(22,163,74,0.10)] text-[var(--color-verified)]'
                    : 'bg-[var(--color-accent-bg)] text-[var(--color-accent)]'
                }`}
              >
                {isVerified ? (
                  <BadgeCheck className="h-5 w-5" />
                ) : (
                  <ShieldCheck className="h-5 w-5" />
                )}
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[var(--color-card-heading)]">
                  {isVerified
                    ? 'Identity verified'
                    : 'Identity verification pending'}
                </h3>

                <p className="mt-1 text-sm leading-6 text-[var(--color-card-text-muted)]">
                  {isVerified
                    ? 'Your identity verification is complete and your verified status can be associated with your author profile.'
                    : 'Complete the verification process to establish a verified author identity.'}
                </p>
              </div>
            </div>
          </div>

          {!isVerified && (
            <button
              type="button"
              className="mt-5 w-full rounded-xl bg-[var(--color-accent)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-hover)]"
            >
              Start Verification
            </button>
          )}
        </div>
      </section>
    </div>
  )
}

