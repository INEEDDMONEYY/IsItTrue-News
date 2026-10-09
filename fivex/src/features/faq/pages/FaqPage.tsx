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
				{
					heading: 'How is my personal data handled?',
					body: [
						'We take privacy seriously. Personal data is handled according to our privacy policy, and we do not share your information without consent.',
					],
				},
				{
					heading: 'How can I become an editor?',
					body: [
						'To become an editor, you need to have a proven track record of accurate fact-checking and editorial experience. Submit an application through your dashboard, and our team will review your credentials.',
					],
				},
				{
					heading: 'How do workshops work?',
					body: [
						`Workshops are for authors and editors to collaborate together on fact-checking and editorial projects.`,
					],
				},
				{
					heading: 'How do I become an Is It True News partner?',
					body: [
						`To become a partner, reach out to our team through the contact form on our website. We will review your proposal and get back to you with the next steps.`,
					],
				},
				{
					heading: 'How does advertising work on IsItTrue News?',
					body: [
						`Advertising on IsItTrue News is managed through our dedicated advertising team. Interested parties/organizations can reach out via the contact form on our website to discuss opportunities, rates, and guidelines for placing ads on our platform.`,
					],
				},
				{
					heading: 'Is there Platform Censorship on IsItTrue News?',
					body: [
						`IsItTrue News aims to provide a balanced and fact-checked news platform. While we have editorial guidelines to ensure accuracy and quality, we do not engage in arbitrary censorship. Content that violates our guidelines may be reviewed and potentially removed.`
					],
				},
				{
					heading: 'How do I upgrade my plan?',
					body: [
						`To upgrade your plan, go to your account settings and select the "Upgrade Plan" option. Follow the prompts to choose your new plan and complete the payment process. Your account will be updated immediately after the successful transaction.`,
					],
				},
				{
					heading: 'Can I cancel my subscription?',
					body: [
						`Yes, you can cancel your subscription at any time through your account settings. Once canceled, your subscription will remain active until the end of the current billing cycle, after which it will not renew.`,
					],
				},
				{
					heading: 'How do I delete my account?',
					body: [
						`To delete your account, go to your account settings and select the "Delete Account" option. Follow the prompts to confirm the deletion. Please note that this action is irreversible and all your data will be permanently removed.`,
					],
				},
				{
					heading: 'How long will it take long for readers topic submissions to get covered?',
					body: [
						`The time it takes for reader topic submissions to get covered can vary depending on the complexity of the topic and the current editorial workload. We strive to review and address submissions as promptly as possible, but we cannot guarantee a specific timeframe or if your topic submission will get covered at all.`,
					],
				},
				{
					heading: 'How do video views works on IsItTrue News?',
					body: [
						`Video views on IsItTrue News are tracked based on the number of times a video is played by users. Each view is counted when a user initiates playback, and repeated views by the same user may also be counted depending on our tracking policies. This helps content creators and our platform understand the popularity and reach of video content.`,
					],
				},
				{
					heading:'Readers limited access reset',
					body: [
						`Users that are on a free reading plan have access to a limited number of articles, search results, and comments. There is also a 60s video clip limit. This will reset each month automatically.`
					]
				},
				{
					heading:'Do I have to wait for a fact-check to publish an article',
					body: [
						`Yes, you will need a fact-check to publish an article on IsItTrue News. This ensures that the information presented is accurate and reliable before it becomes publicly accessible.`
					]
				},
				{
					heading:'How long should a fact-check take?',
					body: [
						`The duration of a fact-check can vary depending on the complexity of the article and the availability of reliable sources. We aim to complete fact-checks as promptly as possible, but it may take anywhere from a few hours to several days. Authors will be notified once the fact-check is complete.`
					]
				},
				{
					heading:'Can I download all my evidence collected in the evidence vault',
					body: [
						`Yes, you can download all the evidence you have collected in the evidence vault. This allows you to keep a personal copy of your research and supporting materials for your records.`
					]
				},
				{
					heading:'Who can edit articles on IsItTrue News?',
					body: [
						`Articles can only be edited by their respective authors or by authorized editors on IsItTrue News.`
					]
				},
				{
					heading:'Do readers have a public profile page?',
					body: [
						`Yes, readers have a public profile page that they can access and update with their personal information, reading preferences, and overall platform activity.`
					]
				},
				{
					heading:'How are documents stored in the evidence vault?',
					body: [
						`Documents in the evidence vault are securely stored using encryption and access control mechanisms to ensure that only authorized users can access them. This helps protect the integrity and confidentiality of the evidence collected.`
					]
				},
				{
					heading:'How do badges work?',
					body: [
						`Badges on IsItTrue News are awarded based on user activity, contributions, and achievements within the platform. They serve as a recognition of a user's engagement and expertise, and can be viewed on the user's public profile page. If the user has 15 years or more of experience they will receive a special badge; in order to receive this badge a work history background check may is required unless it has been 15 years of being a member of IsItTrue News.`
					]
				},
				{
					heading:'How does newsletters work?',
					body: [
						`Newsletters on IsItTrue News allow users to subscribe to regular updates and curated content based on their interests. Users can manage their newsletter subscriptions through their profile settings and choose the frequency and type of content they wish to receive.`
					]
				},
			]}
		/>
	)
}
