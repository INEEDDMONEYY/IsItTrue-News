import { StaticPageLayout } from '@/components/ui/StaticPageLayout'

export function CareersPage() {
  return (
    <StaticPageLayout
      title="Careers"
      intro="We're a small team building tools for a more accountable press. If that sounds like your kind of problem, we'd like to hear from you."
      sections={[
        {
          heading: 'Open Roles',
          body: [
            'We don\u2019t have open roles listed right now, but we\u2019re always open to hearing from journalists, engineers, and researchers who care about editorial integrity. Reach out through our contact page.',
          ],
        },
      ]}
    />
  )
}