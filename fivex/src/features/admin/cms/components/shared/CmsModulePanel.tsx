interface CmsModulePanelProps {
  title: string
  description: string
  features: string[]
}

export function CmsModulePanel({
  title,
  description,
  features,
}: CmsModulePanelProps) {
  return (
    <section className="rounded-2xl border border-card-border bg-card p-5">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-card-heading">
          {title}
        </h2>
        <p className="mt-1 text-sm text-card-text-muted">
          {description}
        </p>
      </div>

      <div className="space-y-3">
        {features.map((feature) => (
          <div
            key={feature}
            className="flex items-start gap-3 text-sm text-card-text"
          >
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
            <span>{feature}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-dashed border-card-border bg-card-2 p-4">
        <p className="text-xs font-medium text-card-heading">
          Integration required
        </p>
        <p className="mt-1 text-xs leading-relaxed text-card-text-muted">
          This is a generated frontend scaffold. Connect this module to its
          existing backend API, services, hooks, and authorization rules
          before enabling management actions.
        </p>
      </div>
    </section>
  )
}
