export type NewsletterFrequency = 'daily' | 'weekly' | 'monthly'

export interface NewsletterEdition {
  id: string
  title: string
  summary: string
  frequency: NewsletterFrequency
  publishedAt: string
  readTime: number
}
