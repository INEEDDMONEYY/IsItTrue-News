import { StaticPageLayout } from '@/components/ui/StaticPageLayout'

export function ContactPage() {
	return (
		<StaticPageLayout
			title="Contact Us"
			intro="Questions, corrections, and newsroom tips are welcome. Reach the team using the appropriate address below."
			sections={[
				{
					heading: 'General Inquiries',
					body: [
						'For account help, partnerships, or general questions, email hello@isittrue.com.',
					],
				},
				{
					heading: 'Editorial and Corrections',
					body: [
						'For story feedback or to report a possible inaccuracy, email corrections@isittrue.com and include the article link and supporting details.',
					],
				},
			]}
		/>
	)
}
