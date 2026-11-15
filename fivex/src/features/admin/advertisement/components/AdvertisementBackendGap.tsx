import type { AdvertisementSection } from '../utils/advertisementSections'

// Lists only the capabilities that are still missing. Renders nothing when the section is fully connected.
export function AdvertisementBackendGap({ section }: { section: AdvertisementSection }) {
  if (section.missing.length === 0) return null
  return (
    <section className="space-y-3 rounded-lg border border-dashed p-6">
      <h2 className="text-lg font-semibold text-foreground">Not yet connected</h2>
      <p className="text-sm text-muted-foreground">
        These capabilities need backend support. Nothing is assumed or shown for them.
      </p>
      <ul className="list-disc space-y-1 pl-5 text-sm">
        {section.missing.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  )
}
