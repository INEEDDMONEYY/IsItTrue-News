import { useState } from 'react'
import { Check, Save, UserRound } from 'lucide-react'
import { PageLoader } from '@/components/loaders/PageLoader'
import { Spinner } from '@/components/ui/Spinner'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { MediaUploadField } from '@/features/authors/components/MediaUploadField'
import { AuthorExpertiseSection } from '@/features/authors/components/settings/AuthorExpertiseSection'
import { useAuthorSettings } from '@/features/authors/hooks/useAuthorSettings'

const INPUT =
  'w-full rounded-xl border border-card-border bg-white px-4 py-3 text-sm text-card-heading outline-none transition placeholder:text-slate-400 focus:border-accent focus:ring-2 focus:ring-accent-bg'

/**
 * The profile section of the account Settings page for editors, organizations and admins: photo, banner, display
 * name and bio, plus expertise & coverage unless `withExpertise` is off (admins don't have it). Saved together.
 * It replaces the name-only section for those roles.
 */
export function StaffProfileSection({ withExpertise = true }: { withExpertise?: boolean }) {
  const { settings, isLoading, isSaving, updateProfile, updateExpertise, saveStaffProfile } = useAuthorSettings()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { profile } = settings
  const nameTooShort = profile.displayName.trim().length < 2

  const handleSave = async () => {
    setError(null)
    if (nameTooShort) {
      setError('Display name must be at least 2 characters.')
      return
    }
    try {
      await saveStaffProfile(withExpertise ? 'staff' : 'identity')
      setSaved(true)
      window.setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  if (isLoading) {
    return <PageLoader label="Loading your profile..." />
  }

  return (
    <>
      <section className="rounded-2xl border border-card-border bg-card p-5">
        <h2 className="text-sm font-semibold text-card-heading mb-1">Profile</h2>
        <p className="text-xs text-card-text-muted mb-5">How you appear on your public profile.</p>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-5 sm:flex-row">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-accent-bg text-accent">
                {profile.profileImage ? (
                  <img src={profile.profileImage} alt="" className="h-full w-full object-cover" />
                ) : (
                  <UserRound className="h-8 w-8" />
                )}
              </div>

              <MediaUploadField
                label="Profile picture"
                accept="image/*"
                kind="image"
                imagePreset="avatar"
                value={profile.profileImage ?? null}
                onChange={(url) => updateProfile({ profileImage: url ?? '' })}
              />
            </div>

            <MediaUploadField
              label="Banner picture"
              helperText="Shown across the top of your public profile."
              accept="image/*"
              kind="image"
              imagePreset="banner"
              value={profile.bannerImage ?? null}
              onChange={(url) => updateProfile({ bannerImage: url ?? '' })}
            />
          </div>

          <div className="max-w-lg">
            <label htmlFor="staff-display-name" className="mb-2 block text-sm font-medium text-card-heading">
              Display name
            </label>
            <input
              id="staff-display-name"
              value={profile.displayName}
              onChange={(event) => updateProfile({ displayName: event.target.value })}
              maxLength={80}
              className={INPUT}
            />
          </div>

          <div>
            <label htmlFor="staff-bio" className="mb-2 block text-sm font-medium text-card-heading">
              Bio
            </label>
            <textarea
              id="staff-bio"
              value={profile.bio}
              onChange={(event) => updateProfile({ bio: event.target.value })}
              rows={4}
              maxLength={1000}
              placeholder="Tell readers about yourself..."
              className={`${INPUT} resize-none`}
            />
            <p className="mt-1 text-xs text-card-text-muted">{profile.bio.length}/1000</p>
          </div>
        </div>
      </section>

      {withExpertise && <AuthorExpertiseSection expertise={settings.expertise} onChange={updateExpertise} />}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-on-brand transition disabled:opacity-60"
        >
          {isSaving ? (
            <Spinner size="sm" className="border-white/40 border-t-white" />
          ) : saved ? (
            <Check className="h-4 w-4" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isSaving ? 'Saving...' : saved ? 'Saved' : 'Save profile'}
        </button>
        {error && (
          <p role="alert" className="text-sm text-disputed">
            {error}
          </p>
        )}
      </div>
    </>
  )
}
