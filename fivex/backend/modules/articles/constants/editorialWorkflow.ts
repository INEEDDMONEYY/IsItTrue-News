export const ARTICLE_EDITORIAL_STAGES = [
  'draft',
  'submitted',
  'reviewing',
  'fact_checking',
  'scheduled',
  'published',
] as const

export type ArticleEditorialStage = (typeof ARTICLE_EDITORIAL_STAGES)[number]
