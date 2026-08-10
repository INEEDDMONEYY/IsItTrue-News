import { StaticPageLayout } from '@/components/ui/StaticPageLayout'

export function AboutPage() {
  return (
    <StaticPageLayout
      title="About Us"
      intro="IsItTrue exists to help readers separate verified fact from noise, one sourced story at a time."
      sections={[
        {
          heading: 'Our Mission',
          body: [
            'We built IsItTrue because trust in news reporting has eroded, and readers deserve a platform that shows its work. Every story we publish is checked against primary sources before it goes live.',
          ],
        },
        {
          heading: 'How We Work',
          body: [
            'Our editorial team cross-references claims against public records, official statements, and independent reporting. Where a claim is disputed, we say so clearly rather than presenting it as settled.',
          ],
        },
      ]}
    />
  )
}