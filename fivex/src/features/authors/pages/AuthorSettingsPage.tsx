import { useState } from 'react'
import { Check, Save, Settings2 } from 'lucide-react'

import { AuthorProfileSection } from '../components/settings/AuthorProfileSection'
import { AuthorExpertiseSection } from '../components/settings/AuthorExpertiseSection'
import { AuthorPublishingSection } from '../components/settings/AuthorPublishingSection'
import { AuthorPreferencesSection } from '../components/settings/AuthorPreferencesSection'
import { AuthorStatusSection } from '../components/settings/AuthorStatusSection'
import { useAuthorSettings } from '../hooks/useAuthorSettings'

export function AuthorSettingsPage() {
  const {
    settings,
    updateProfile,
    updateExpertise,
    updatePublishing,
    updatePreferences,
    saveSettings,
  } = useAuthorSettings()

  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    await saveSettings()

    setSaved(true)

    window.setTimeout(() => {
      setSaved(false)
    }, 2500)
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col gap-5 border-b border-[var(--color-card-border)] pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2 text-[var(--color-accent)]">
            <Settings2 className="h-5 w-5" />

            <span className="text-sm font-semibold">
              Author Workspace
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-[var(--color-heading)]">
            Author Settings
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">
            Manage your journalist profile, expertise, publishing
            preferences, and editorial notifications.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-hover)]"
        >
          {saved ? (
            <Check className="h-4 w-4" />
          ) : (
            <Save className="h-4 w-4" />
          )}

          {saved ? 'Saved' : 'Save Changes'}
        </button>
      </header>

      <div className="space-y-6">
        <AuthorProfileSection
          profile={settings.profile}
          onChange={updateProfile}
        />

        <AuthorExpertiseSection
          expertise={settings.expertise}
          onChange={updateExpertise}
        />

        <AuthorPublishingSection
          publishing={settings.publishing}
          onChange={updatePublishing}
        />

        <AuthorPreferencesSection
          preferences={settings.preferences}
          onChange={updatePreferences}
        />

        <AuthorStatusSection status={settings.status} />
      </div>
    </main>
  )
}