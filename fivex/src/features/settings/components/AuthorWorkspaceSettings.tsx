import { useState } from 'react'
import { Check, Save } from 'lucide-react'
import { PageLoader } from '@/components/loaders/PageLoader'
import { Spinner } from '@/components/ui/Spinner'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { AuthorPublishingSection } from '@/features/authors/components/settings/AuthorPublishingSection'
import { AuthorPreferencesSection } from '@/features/authors/components/settings/AuthorPreferencesSection'
import { useAuthorSettings } from '@/features/authors/hooks/useAuthorSettings'

/**
 * Publishing preferences and author notifications. Only rendered for authors (the hook reads the author's own
 * profile), so other roles never see or load these.
 */
export function AuthorWorkspaceSettings() {
  const { settings, isLoading, isSaving, updatePublishing, updatePreferences, savePublishingSettings } =
    useAuthorSettings()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    setError(null)
    try {
      await savePublishingSettings()
      setSaved(true)
      window.setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  if (isLoading) {
    return <PageLoader label="Loading your author preferences..." />
  }

  return (
    <>
      <AuthorPublishingSection publishing={settings.publishing} onChange={updatePublishing} />
      <AuthorPreferencesSection preferences={settings.preferences} onChange={updatePreferences} />

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
          {isSaving ? 'Saving...' : saved ? 'Saved' : 'Save author preferences'}
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
