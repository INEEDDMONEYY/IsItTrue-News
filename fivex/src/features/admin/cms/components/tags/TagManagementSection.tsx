import { CmsModulePanel } from '../shared/CmsModulePanel'

export function TagManagementSection() {
  return (
    <CmsModulePanel
      title="Tag Management"
      description="Manage article tags and the classification terms used across IITNews."
      features={[
        'Create and edit article tags',
        'Manage tag descriptions and slugs',
        'Search and filter existing tags',
        'Manage tag visibility',
        'Review tag usage across articles',
        'Prevent deletion of tags still in use',
      ]}
    />
  )
}
