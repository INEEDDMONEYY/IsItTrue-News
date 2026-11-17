export const ARTICLE_EDITORIAL_STAGES = [
  'draft',
  'submitted',
  'reviewing',
  'fact_checking',
  'scheduled',
  'published',
] as const

export type ArticleEditorialStage = (typeof ARTICLE_EDITORIAL_STAGES)[number]

// Mirrors EDITOR_SETTABLE_ARTICLE_STAGES on the backend. Draft, submitted and
// published are set by the submission and publish flows, not by the editor.
export const EDITOR_SETTABLE_ARTICLE_STAGES = ['reviewing', 'fact_checking', 'scheduled'] as const
export type EditorSettableArticleStage = (typeof EDITOR_SETTABLE_ARTICLE_STAGES)[number]

export const INVESTIGATION_WORKFLOW_STAGES = [
  'research',
  'interviews',
  'evidence_gathering',
  'verification',
  'editorial_review',
  'publication',
] as const

export type InvestigationWorkflowStage = (typeof INVESTIGATION_WORKFLOW_STAGES)[number]

export const articleStageLabels: Record<ArticleEditorialStage, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  reviewing: 'Reviewing',
  fact_checking: 'Fact checking',
  scheduled: 'Scheduled',
  published: 'Published',
}

export const investigationStageLabels: Record<InvestigationWorkflowStage, string> = {
  research: 'Research',
  interviews: 'Interviews',
  evidence_gathering: 'Evidence gathering',
  verification: 'Verification',
  editorial_review: 'Editorial review',
  publication: 'Publication',
}

interface WorkflowItem {
  id: string
  title: string
  slug: string
  status: string
  editorialDeadline?: string
  createdAt: string
  updatedAt: string
  author?: { id?: string; name?: string } | null
}

export interface ArticleWorkflowItem extends WorkflowItem {
  kind: 'article'
  editorialStage: ArticleEditorialStage
  category?: string
  factCheckStatus?: string
  assignee?: { id?: string; name?: string } | null
}

// Editor account that can be assigned an article (id and name only).
export interface EditorAccount {
  id: string
  name: string
}

export interface InvestigationWorkflowItem extends WorkflowItem {
  kind: 'investigation'
  workflowStage: InvestigationWorkflowStage
}

export type EditorialCalendarItem = ArticleWorkflowItem | InvestigationWorkflowItem

// The server computes editorial deadlines (30 days from each stage change), so updates send only the stage.
export type EditorialWorkflowUpdate =
  | {
      kind: 'article'
      id: string
      stage: EditorSettableArticleStage
    }
  | {
      kind: 'investigation'
      id: string
      stage: InvestigationWorkflowStage
    }
