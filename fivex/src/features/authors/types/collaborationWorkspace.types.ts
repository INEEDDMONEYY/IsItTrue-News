
export type WorkspaceResourceType =
  | 'article'
  | 'research'
  | 'evidence'
  | 'document'

export type WorkspaceStage =
  | 'planning'
  | 'research'
  | 'drafting'
  | 'review'
  | 'completed'

export interface WorkspaceResource {
  id: string
  title: string
  description: string
  type: WorkspaceResourceType
  updatedAt: string
  updatedBy: string
  status: 'in-progress' | 'ready' | 'needs-review'
}

export interface CollaborationWorkspace {
  id: string
  collaborationId: string
  summary: string
  stage: WorkspaceStage
  progress: number
  nextMilestone: string
  resources: WorkspaceResource[]
}
