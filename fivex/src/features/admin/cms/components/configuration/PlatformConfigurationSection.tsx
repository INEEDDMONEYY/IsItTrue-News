import { CmsModulePanel } from '../shared/CmsModulePanel'

export function PlatformConfigurationSection() {
  return (
    <CmsModulePanel
      title="Platform Configuration"
      description="Manage public-facing content presentation and website display preferences."
      features={[
        'Configure default article display preferences',
        'Manage date and time presentation',
        'Configure author byline presentation',
        'Manage default category behavior',
        'Configure public-facing feature visibility',
        'Manage content display limits',
      ]}
    />
  )
}
