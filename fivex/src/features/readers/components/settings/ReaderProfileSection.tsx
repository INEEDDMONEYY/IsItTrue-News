import { useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Camera, Check, Loader2, Save, UserRound } from 'lucide-react'
import { authorSettingsApi } from '@/features/authors/api/authorSettings.api'
import { useMediaUpload } from '@/features/authors/hooks/useMediaUpload'
import { useAuth } from '@/app/providers/AuthProvider'
import { getErrorMessage } from '@/lib/getErrorMessage'

/**
 * Lets a reader set their display name, bio, and profile photo. Reuses the
 * role-agnostic author-profile endpoints (professionalName/bio/profileImage)
 * so the same data instantly carries over if/when the reader becomes an
 * author via the "Become an Author" onboarding flow.
 */
export function ReaderProfileSection() {
  const { user, updateUser } = useAuth()
  const { upload, isUploading } = useMediaUpload({ profilePhoto: true })

  const { data, isLoading } = useQuery({
    queryKey: ['reader-profile-settings'],
    queryFn: authorSettingsApi.getMine,
  })

  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [profileImage, setProfileImage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!data) return
    setName(data.name ?? '')
    setBio(data.authorProfile.bio ?? '')
    setProfileImage(data.authorProfile.profileImage ?? '')
  }, [data])

  const saveMutation = useMutation({
    mutationFn: async () => {
      await Promise.all([
        authorSettingsApi.updateName(name.trim()),
        authorSettingsApi.updateProfile({ bio: bio.trim(), profileImage }),
      ])
    },
    onSuccess: () => {
      updateUser({
        name: name.trim(),
        authorProfile: { ...user?.authorProfile, profileImage },
      })
      setSaved(true)
      window.setTimeout(() => setSaved(false), 2500)
    },
    onError: (err) => setError(getErrorMessage(err, 'Failed to save your profile.')),
  })

  const handlePhotoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setError(null)
    try {
      const media = await upload(file)
      setProfileImage(media.url)
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to upload profile photo.'))
    }
  }

  if (isLoading || !user) {
    return null
  }

  return (
    <section className="rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] p-6 shadow-sm">
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent-bg)] text-[var(--color-accent)]">
          <UserRound className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-[var(--color-card-heading)]">Your Profile</h2>
          <p className="mt-1 text-sm leading-6 text-[var(--color-card-text-muted)]">
            Update your profile photo, name, and bio.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-[var(--color-disputed)] bg-[rgba(220,38,38,0.06)] p-3 text-sm text-[var(--color-disputed)]">
          {error}
        </div>
      )}

      <div className="space-y-5">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--color-card-border)] bg-[var(--color-accent-bg)] text-[var(--color-accent)]">
            {profileImage ? (
              <img src={profileImage} alt="" className="h-full w-full object-cover" />
            ) : (
              <UserRound className="h-6 w-6" />
            )}
          </div>
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-[var(--color-card-border)] px-4 py-2.5 text-sm font-semibold text-[var(--color-card-heading)] hover:border-[var(--color-accent)]">
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
            {isUploading ? 'Uploading...' : 'Change photo'}
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          </label>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--color-card-heading)]">Name</label>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-xl border border-[var(--color-card-border)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-bg)]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--color-card-heading)]">Bio</label>
          <textarea
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            rows={4}
            maxLength={1000}
            placeholder="Tell other readers a bit about yourself..."
            className="w-full rounded-xl border border-[var(--color-card-border)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-bg)]"
          />
        </div>

        <button
          type="button"
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-on-brand transition disabled:opacity-60"
        >
          {saveMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : saved ? (
            <Check className="h-4 w-4" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saveMutation.isPending ? 'Saving...' : saved ? 'Saved' : 'Save Profile'}
        </button>
      </div>
    </section>
  )
}
