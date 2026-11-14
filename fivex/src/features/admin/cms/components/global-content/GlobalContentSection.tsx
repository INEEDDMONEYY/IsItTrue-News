import { CmsModulePanel } from '../shared/CmsModulePanel'

export function GlobalContentSection() {
  return (
    <CmsModulePanel
      title="Global Website Content"
      description="Manage reusable content and messaging displayed throughout the public website."
      features={[
        'Manage announcement bars',
        'Manage promotional banners',
        'Edit newsletter signup messaging',
        'Manage footer descriptions and contact details',
        'Configure social media links',
        'Manage reusable content blocks',
      ]}
    />
  )
}
