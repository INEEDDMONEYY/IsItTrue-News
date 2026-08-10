
import {
  CheckCircle2,
  MapPin,
  UserRound,
} from 'lucide-react'

import { VerificationBadge } from '@/features/profile/components/VerificationBadge'
import type { ProfileIdentity } from '@/features/profile/types/profileIdentity.types'

interface ProfileHeaderProps {
  profile: ProfileIdentity
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
      <div className="h-24 bg-[var(--color-accent-bg)] sm:h-28" />

      <div className="px-5 pb-6 sm:px-7">
        <div className="-mt-12 flex flex-col gap-5 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-[var(--color-surface)] bg-[var(--color-surface-2)] text-[var(--color-text-muted)] shadow-sm sm:h-28 sm:w-28">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserRound className="h-10 w-10" />
              )}
            </div>

            <div className="pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-[var(--color-heading)]">
                  {profile.displayName}
                </h1>

                {profile.verificationStatus === 'verified' && (
                  <CheckCircle2
                    className="h-5 w-5 text-[var(--color-verified)]"
                    aria-label="Verified author"
                  />
                )}
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--color-text-muted)]">
                <span>{profile.username}</span>

                <span
                  aria-hidden="true"
                  className="hidden sm:inline"
                >
                  •
                </span>

                <span className="font-medium text-[var(--color-accent)]">
                  Author
                </span>

                {profile.location && (
                  <>
                    <span
                      aria-hidden="true"
                      className="hidden sm:inline"
                    >
                      •
                    </span>

                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {profile.location}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <VerificationBadge status={profile.verificationStatus} />
        </div>

        {profile.bio && (
          <p className="mt-6 max-w-3xl text-sm leading-6 text-[var(--color-text-muted)]">
            {profile.bio}
          </p>
        )}

        <div className="mt-6 border-t border-[var(--color-border)] pt-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[var(--color-heading)]">
                Profile completion
              </p>

              <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                Complete your profile to strengthen your author identity.
              </p>
            </div>

            <span className="text-sm font-bold text-[var(--color-accent)]">
              {profile.profileCompletion}%
            </span>
          </div>

          <div
            className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--color-surface-2)]"
            role="progressbar"
            aria-valuenow={profile.profileCompletion}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Profile completion"
          >
            <div
              className="h-full rounded-full bg-[var(--color-accent)] transition-all"
              style={{ width: `${profile.profileCompletion}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

