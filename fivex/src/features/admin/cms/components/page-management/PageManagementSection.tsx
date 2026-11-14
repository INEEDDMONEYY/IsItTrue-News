import { CmsModulePanel } from '../shared/CmsModulePanel'

export function PageManagementSection() {
  return (
    <CmsModulePanel
      title="Page Management"
      description="Manage static website pages, publication status, revisions, and page metadata."
      features={[
        'Create and edit public website pages',
        'Publish, unpublish, and archive pages',
        'Manage page revisions and version history',
        'Configure page titles and metadata',
        'Preview pages before publication',
        'Manage custom landing pages',
      ]}
    />
  )
}
