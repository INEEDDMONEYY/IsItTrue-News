import type { NewsletterEdition } from '@/features/newsletter/types/newsletter.types'

export const mockNewsletters: NewsletterEdition[] = [
  {
    id: 'newsletter-001',
    title: 'The Weekly Fact Check',
    summary:
      "This week's most-shared claims, verified against primary sources.",
    frequency: 'weekly',
    publishedAt: '2026-08-04T08:00:00Z',
    readTime: 4,
  },
  {
    id: 'newsletter-002',
    title: 'Behind the Investigation',
    summary:
      'A look at how our reporters built out an ongoing investigation, sources included.',
    frequency: 'weekly',
    publishedAt: '2026-07-28T08:00:00Z',
    readTime: 6,
  },
  {
    id: 'newsletter-003',
    title: 'Monthly Corrections Roundup',
    summary:
      'Every correction we issued last month, and what we learned from each one.',
    frequency: 'monthly',
    publishedAt: '2026-07-01T08:00:00Z',
    readTime: 3,
  },
]
