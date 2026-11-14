import { CmsModulePanel } from '../shared/CmsModulePanel'

export function HomepageManagementSection() {
  return (
    <CmsModulePanel
      title="Homepage Management"
      description="Control the stories, sections, and announcements displayed on the IITNews homepage."
      features={[
        'Manage hero stories and featured articles',
        'Configure editor picks and trending stories',
        'Organize homepage content sections',
        'Manage featured investigations and fact-checks',
        'Schedule homepage content',
        'Manage breaking news banners',
      ]}
    />
  )
}
