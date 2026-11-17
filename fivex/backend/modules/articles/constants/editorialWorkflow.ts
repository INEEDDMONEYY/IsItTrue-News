export const ARTICLE_EDITORIAL_STAGES = [
  'draft',
  'submitted',
  'reviewing',
  'fact_checking',
  'scheduled',
  'published',
] as const

export type ArticleEditorialStage = (typeof ARTICLE_EDITORIAL_STAGES)[number]

// Draft, submitted and published are set by the submission and publish flows,
// so the editor workflow endpoint can only move an article into these stages.
export const EDITOR_SETTABLE_ARTICLE_STAGES = ['reviewing', 'fact_checking', 'scheduled'] as const
export type EditorSettableArticleStage = (typeof EDITOR_SETTABLE_ARTICLE_STAGES)[number]
