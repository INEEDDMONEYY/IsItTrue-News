export type PricingTierId = 'free' | 'reader-premium' | 'author-free' | 'author-premium' | 'editor-premium'

export interface PricingTier {
  id: PricingTierId
  name: string
  price: string
  cadence?: string
  description: string
  perks: string[]
  highlighted?: boolean
  comingSoon?: boolean
}

export const READER_PRICING_TIERS: PricingTier[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    cadence: 'forever',
    description:
      'Read, comment, bookmark, and follow authors across the platform.',
    perks: [
      'Access to 3 full articles to read every month',
      'Follow your favorite authors',
      'Bookmark & share the content that resonates with you the best',
      'Follow Investigations',
      'Get notified when favorite author adds new evidence',
      'Notifications when favorite author updates case file',
      '30-60 seconds access to video clips',
      'Search Authors, Topics, Investigations, and Videos limited to 10 searches every month',
      '2 Topic Submissions every month, readers can submit questions, topic suggestions, & local issues.',
    ],
  },
  {
    id: 'reader-premium',
    name: 'Reader Premium',
    price: '$6',
    cadence: '/ month',
    description:
      'Unlimited reading and full access to the investigations behind every story.',
    perks: [
      'Unlimited full articles every month',
      'Full Investigation Access — case files, evidence vault, source documents, interviews & timelines',
      'Unlimited-length video access, no clip caps',
      'Unlimited search across authors, topics, investigations, and videos',
      'Unlimited Topic Submissions',
      'Priority notifications for followed authors & investigations',
      'Ad-free reading experience',
    ],
    highlighted: true,
  },
]

export const AUTHOR_PRICING_TIERS: PricingTier[] = [
  {
    id: 'author-free',
    name: 'Author Free',
    price: '$0',
    cadence: 'forever',
    description: 'Start publishing and building your byline at no cost.',
    perks: [
      'Write & publish articles',
      'Basic Drafts workspace',
      'Public author profile & follower count',
      'Basic performance stats',
      'Submit fact-check requests',
    ],
  },
  {
    id: 'author-premium',
    name: 'Author Premium',
    price: '$12',
    cadence: '/ month',
    description:
      'Everything a working journalist needs to research, collaborate, and publish faster.',
    perks: [
      'My Drafts workspace',
      'Pitch Center',
      'Collaboration Room',
      'Evidence Vault',
      'My Investigations',
      'Advanced Analytics',
    ],
    highlighted: true,
  },
]

export const EDITOR_PRICING_TIERS: PricingTier[] = [
  {
    id: 'editor-premium',
    name: 'Editor Premium',
    price: 'Coming soon',
    description:
      'Editorial workflow tools for review, assignment, and newsroom oversight.',
    perks: [
      'Team assignments',
      'Editorial calendar',
      'Advanced moderation tools',
    ],
    comingSoon: true,
  },
]

export const PRICING_TIERS: PricingTier[] = [
  ...READER_PRICING_TIERS,
  ...AUTHOR_PRICING_TIERS,
  ...EDITOR_PRICING_TIERS,
]

