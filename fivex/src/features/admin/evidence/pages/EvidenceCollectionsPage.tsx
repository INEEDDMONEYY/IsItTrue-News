/**
 * Evidence Collections
 *
 * Connect this page to the feature's existing data hooks.
 * Add filters, pagination, and actions according to the
 * established conventions in this module.
 */

export function EvidenceCollectionsPage() {
  return (
    <div className="space-y-6">
      
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-heading">
          Evidence Collections
        </h1>

        <p className="text-sm text-text-muted">
          Manage evidence collections.
        </p>
      </header>

      <section className="rounded-2xl border border-card-border bg-card p-5">
        <h2 className="text-lg font-semibold text-card-heading">
          Evidence Collections
        </h2>

        <p className="mt-2 text-sm text-card-text-muted">
          Connect the existing feature data source to display records here.
        </p>
      </section>
    </div>
  )
}
