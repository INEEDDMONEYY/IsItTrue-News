import { UserRound } from 'lucide-react'
import { MediaUploadField } from '../MediaUploadField'
import type { AuthorProfileSettings } from '../../types/authorSettings.types'

interface AuthorProfileSectionProps {
  profile: AuthorProfileSettings
  onChange: (updates: Partial<AuthorProfileSettings>) => void
}

export function AuthorProfileSection({
  profile,
  onChange,
}: AuthorProfileSectionProps) {
  return (
    <section className="rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[var(--color-card-heading)]">
          Author Profile
        </h2>

        <p className="mt-1 text-sm leading-6 text-[var(--color-card-text-muted)]">
          Manage the professional information readers and editors see
          about you.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-5 sm:flex-row">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[var(--color-accent-bg)] text-[var(--color-accent)]">
              {profile.profileImage ? (
                <img
                  src={profile.profileImage}
                  alt={profile.displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserRound className="h-8 w-8" />
              )}
            </div>

            <MediaUploadField
              label="Profile photo"
              accept="image/*"
              kind="image"
              imagePreset="avatar"
              value={profile.profileImage ?? null}
              onChange={(url) => onChange({ profileImage: url ?? '' })}
            />
          </div>

          <MediaUploadField
            label="Banner image"
            helperText="Shown across the top of your public profile."
            accept="image/*"
            kind="image"
            imagePreset="banner"
            value={profile.bannerImage ?? null}
            onChange={(url) => onChange({ bannerImage: url ?? '' })}
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Field
            label="Display name"
            value={profile.displayName}
            onChange={(value) =>
              onChange({ displayName: value })
            }
          />

          <Field
            label="Professional name"
            value={profile.professionalName}
            onChange={(value) =>
              onChange({ professionalName: value })
            }
          />

          <Field
            label="Location"
            value={profile.location}
            onChange={(value) =>
              onChange({ location: value })
            }
          />

          <Field
            label="Website"
            value={profile.website}
            placeholder="https://"
            onChange={(value) =>
              onChange({ website: value })
            }
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--color-card-heading)]">
            Author bio
          </label>

          <textarea
            value={profile.bio}
            onChange={(event) =>
              onChange({ bio: event.target.value })
            }
            rows={4}
            className="w-full resize-none rounded-xl border border-[var(--color-card-border)] bg-white px-4 py-3 text-sm text-[var(--color-card-heading)] outline-none transition placeholder:text-slate-400 focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-bg)]"
            placeholder="Tell readers about your journalism work..."
          />
        </div>
      </div>
    </section>
  )
}

interface FieldProps {
  label: string
  value: string
  placeholder?: string
  onChange: (value: string) => void
}

function Field({
  label,
  value,
  placeholder,
  onChange,
}: FieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[var(--color-card-heading)]">
        {label}
      </label>

      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-[var(--color-card-border)] bg-white px-4 py-3 text-sm text-[var(--color-card-heading)] outline-none transition placeholder:text-slate-400 focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-bg)]"
      />
    </div>
  )
}