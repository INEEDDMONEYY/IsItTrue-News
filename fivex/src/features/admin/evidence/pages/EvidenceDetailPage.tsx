/**
 * Evidence Detail
 *
 * Load and display an individual record.
 * Reuse existing detail components and data hooks where available.
 */

export function EvidenceDetailPage() {
  return (
    <div className="space-y-6">
      
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-heading">
          Evidence Detail
        </h1>

        <p className="text-sm text-text-muted">
          Manage evidence detail.
        </p>
      </header>

      <section className="rounded-2xl border border-card-border bg-card p-5">
        <h2 className="text-lg font-semibold text-card-heading">
          Record Details
        </h2>

        <p className="mt-2 text-sm text-card-text-muted">
          Connect the record identifier, existing detail hook,
          and feature components.
        </p>
      </section>
    </div>
  )
}
