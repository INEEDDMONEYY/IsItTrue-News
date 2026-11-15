/**
 * Create Evidence
 *
 * Add the feature's existing form components, validation,
 * mutation hooks, and navigation behavior here.
 */

export function CreateEvidencePage() {
  return (
    <div className="space-y-6">
      
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-heading">
          Create Evidence
        </h1>

        <p className="text-sm text-text-muted">
          Manage create evidence.
        </p>
      </header>

      <section className="rounded-2xl border border-card-border bg-card p-5">
        <h2 className="text-lg font-semibold text-card-heading">
          Create Evidence
        </h2>

        <p className="mt-2 text-sm text-card-text-muted">
          Add the appropriate form fields and connect them to the
          existing create operation for this feature.
        </p>
      </section>
    </div>
  )
}
