import { StaticPageLayout } from '@/components/ui/StaticPageLayout'

export function FaqPage() {
	return (
		<StaticPageLayout
			title="Frequently Asked Questions"
			intro="Answers to the questions we hear most often about how IsItTrue News works."
			sections={[
				{
					heading: 'What is IsItTrue News?',
					body: [
						'IsItTrue News is a fact-checked news platform. Every published article goes through an editorial review, and readers can see the verification status behind each story.',
					],
				},
				{
					heading: 'How are articles fact-checked?',
					body: [
						'Authors submit articles for review, and editors verify claims against primary sources before publishing. Readers can also flag claims for a dedicated fact check.',
					],
				},
				{
					heading: 'How do I report an inaccuracy?',
					body: [
						'Email corrections@isittrue.com with the article link and details, or submit a support ticket and our team will follow up.',
					],
				},
				{
					heading: 'How do I become an author or submit fact checks?',
					body: [
						'Create an account and apply through your dashboard. Once approved, you can publish articles and submit fact checks for editorial review.',
					],
				},
				{
					heading: 'I have a different issue — how do I get help?',
					body: [
						'Submit a ticket describing your issue and we\u2019ll get back to you at the email address you provide.',
					],
				},
			]}
		/>
	)
}
