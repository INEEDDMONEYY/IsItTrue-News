export const INVESTIGATION_WORKFLOW_STAGES = [
  'research',
  'interviews',
  'evidence_gathering',
  'verification',
  'editorial_review',
  'publication',
] as const

export type InvestigationWorkflowStage = (typeof INVESTIGATION_WORKFLOW_STAGES)[number]
