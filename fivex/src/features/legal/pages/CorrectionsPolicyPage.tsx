import { StaticPageLayout } from '@/components/ui/StaticPageLayout'

export function CorrectionsPolicyPage() {
  return (
    <StaticPageLayout
      title="Corrections Policy"
      lastUpdated="July 2026"
      intro="Accuracy is the foundation of everything we publish. When we get something wrong, we correct it transparently."
      sections={[
        {
          heading: 'How We Handle Errors',
          body: [
            'When a factual error is identified, we update the article and append a visible correction note stating what changed and when.',
          ],
        },
        {
          heading: 'Reporting an Error',
          body: [
            'If you believe a story contains an inaccuracy, email corrections@isittrue.com with the article link and details. Our editorial team reviews every submission.',
          ],
        },
      ]}
    />
  )
}