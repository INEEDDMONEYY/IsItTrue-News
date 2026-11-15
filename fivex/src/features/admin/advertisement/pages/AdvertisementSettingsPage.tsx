import { AdvertisementSectionLayout } from '../components/AdvertisementSectionLayout'
import { AdvertisementBackendGap } from '../components/AdvertisementBackendGap'
import { AdvertisementQueryState, AdvertisementStatCard } from '../components/AdvertisementPrimitives'
import { useAdvertisementSettings } from '../hooks/useAdvertisement'
import { requireAdvertisementSection } from '../utils/advertisementSections'
import { PLACEMENT_LABELS, formatMoney } from '@/features/advertiser/utils/format'

const section = requireAdvertisementSection('settings')

// Read-only view of the pricing and rules the backend enforces. Nothing here is editable yet.
export function AdvertisementSettingsPage() {
  const { data, isLoading, error } = useAdvertisementSettings()

  return (
    <AdvertisementSectionLayout section={section}>
      <AdvertisementQueryState isLoading={isLoading} error={error}>
        {data ? (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Campaign approval is {data.autoApproveCampaigns ? 'automatic' : 'manual'}. Values below are read-only.
            </p>
            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">Placement pricing (per campaign)</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="py-2 pr-4">Placement</th>
                      {data.campaignDurations.map((days) => (
                        <th key={days} className="py-2 pr-4">
                          {days} days
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(Object.keys(data.rates) as Array<keyof typeof data.rates>).map((placement) => (
                      <tr key={placement} className="border-b">
                        <td className="py-2 pr-4 font-medium">{PLACEMENT_LABELS[placement]}</td>
                        {data.campaignDurations.map((days) => (
                          <td key={days} className="py-2 pr-4">
                            {formatMoney(data.rates[placement][String(days) as '7' | '30'])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
            <div className="grid gap-4 sm:grid-cols-3">
              <AdvertisementStatCard label="Newsletter send" value={formatMoney(data.newsletter.sendCents)} />
              <AdvertisementStatCard label="Newsletter window" value={`${data.newsletter.windowDays} days`} />
              <AdvertisementStatCard label="Max sends per window" value={String(data.newsletter.maxSends)} />
            </div>
            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">Bundles</h2>
              <ul className="grid gap-3 md:grid-cols-2">
                {data.bundles.map((bundle) => (
                  <li key={bundle.id} className="rounded-lg border p-4">
                    <p className="font-medium">
                      {bundle.name} · {formatMoney(bundle.priceCents)}
                      {bundle.recommended ? <span className="ml-2 text-xs text-muted-foreground">recommended</span> : null}
                    </p>
                    <p className="text-sm text-muted-foreground">{bundle.description}</p>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        ) : null}
      </AdvertisementQueryState>
      <AdvertisementBackendGap section={section} />
    </AdvertisementSectionLayout>
  )
}
