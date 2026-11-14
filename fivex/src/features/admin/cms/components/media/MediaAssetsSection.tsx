import { CmsModulePanel } from '../shared/CmsModulePanel'

export function MediaAssetsSection() {
  return (
    <CmsModulePanel
      title="Media & Assets"
      description="Manage public-facing website images, branding assets, and reusable media."
      features={[
        'Manage logos and brand assets',
        'Manage homepage and page banner images',
        'Manage article thumbnails',
        'Manage category images',
        'Edit image alternative text',
        'Track asset usage across public pages',
      ]}
    />
  )
}
