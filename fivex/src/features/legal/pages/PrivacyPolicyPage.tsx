import { StaticPageLayout } from '@/components/ui/StaticPageLayout'

export function PrivacyPolicyPage() {
  return (
    <StaticPageLayout
      title="Privacy Policy"
      lastUpdated="July 2026"
      sections={[
        {
          heading: 'Information We Collect',
          body: [
            'We collect information you provide directly, such as your name and email when you create an account, along with basic usage data to improve the platform.',
          ],
        },
        {
          heading: 'How We Use Your Information',
          body: [
            'We use your information to operate your account, personalize your reading experience, and communicate important updates. We do not sell your personal data to third parties.',
          ],
        },
        {
          heading: 'Your Rights',
          body: [
            'You can request access to, correction of, or deletion of your personal data at any time by contacting privacy@isittrue.com.',
          ],
        },
      ]}
    />
  )
}