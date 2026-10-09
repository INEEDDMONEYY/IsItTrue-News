import { useState } from 'react'
import { Check, Save, BookOpenText } from 'lucide-react'

import { PageLoader } from '@/components/loaders/PageLoader'
import { Spinner } from '@/components/ui/Spinner'
import { ReaderExperienceSection } from '../components/settings/ReaderExperienceSection'
import { ReaderContentPreferencesSection } from '../components/settings/ReaderContentPreferencesSection'
import { ReaderProfileSection } from '../components/settings/ReaderProfileSection'
import { useReaderSettings } from '../hooks/useReaderSettings'

export function ReaderSettingsPage() {
  const { settings, isLoading, isSaving, updateExperience, updateContent, saveSettings } =
    useReaderSettings()

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
            <BookOpenText className="h-5 w-5" />

            <span className="text-sm font-semibold">Reading Preferences</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-[var(--color-heading)]">
            Reader Settings
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">
            Customize your reading experience and choose the topics, regions,
            and formats you want to see more of.
          </p>
        </div>

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

          {isSaving ? 'Saving...' : saved ? 'Saved' : 'Save Changes'}
        </button>
      </header>

      {isLoading ? (
        <PageLoader label="Loading your reading preferences..." />
      ) : (
        <div className="space-y-6">
          <ReaderProfileSection />

          <ReaderExperienceSection
            experience={settings.experience}
            onChange={updateExperience}
          />

          <ReaderContentPreferencesSection
            content={settings.content}
            onChange={updateContent}
          />
        </div>
      )}
    </main>
  )
}
