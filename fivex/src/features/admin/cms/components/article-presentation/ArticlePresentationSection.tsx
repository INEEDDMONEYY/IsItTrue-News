import { CmsModulePanel } from '../shared/CmsModulePanel'

export function ArticlePresentationSection() {
  return (
    <CmsModulePanel
      title="Article Presentation"
      description="Control how published articles are displayed and recommended across IITNews."
      features={[
        'Manage featured and pinned articles',
        'Configure homepage article placement',
        'Manage related article recommendations',
        'Configure article display labels',
        'Manage recommended reading sections',
        'Configure article presentation preferences',
      ]}
    />
  )
}
