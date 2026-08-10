import { StaticPageLayout } from '@/components/ui/StaticPageLayout'

export function TermsOfServicePage() {
  return (
    <StaticPageLayout
      title="Terms of Service"
      lastUpdated="July 2026"
      sections={[
        {
          heading: 'Acceptance of Terms',
          body: [
            'By accessing IsItTrue, you agree to be bound by these terms. If you disagree with any part of them, please discontinue use of the platform.',
          ],
        },
        {
          heading: 'Use of Content',
          body: [
            'Articles and content published on IsItTrue are for personal, non-commercial use unless otherwise licensed. Redistribution requires prior written consent.',
          ],
        },
        {
          heading: 'Account Responsibilities',
          body: [
            'You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account.',
          ],
        },
      ]}
    />
  )
}