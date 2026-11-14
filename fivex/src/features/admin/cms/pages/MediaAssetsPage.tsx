import { MediaAssetsSection } from '../components/media/MediaAssetsSection'
import { CmsBreadcrumb } from '../components/shared/CmsBreadcrumb'

export function MediaAssetsPage() {
  return (
    <div className="space-y-6">
      <CmsBreadcrumb current="Media & Assets" />
      <header>
        <h1 className="text-2xl font-semibold text-heading">
          Media & Assets
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Manage public-facing website images, branding assets, and reusable media.
        </p>
      </header>

      <MediaAssetsSection />
    </div>
  )
}
