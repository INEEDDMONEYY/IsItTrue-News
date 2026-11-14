import { CmsModulePanel } from '../shared/CmsModulePanel'

export function NavigationManagementSection() {
  return (
    <CmsModulePanel
      title="Navigation Management"
      description="Manage public-facing website navigation, menus, and footer links."
      features={[
        'Manage header navigation',
        'Manage footer navigation',
        'Create dropdown menus',
        'Reorder navigation items',
        'Configure external links',
        'Control mobile navigation visibility',
      ]}
    />
  )
}
