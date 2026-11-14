
import type { CollaborationWorkspace } from '../types/collaborationWorkspace.types'

export const mockCollaborationWorkspaces: CollaborationWorkspace[] = [
  {
    id: 'workspace-1',
    collaborationId: 'collab-1',
    summary:
      'A collaborative investigation into public infrastructure spending, project delays, government contracts, and public accountability.',
    stage: 'research',
    progress: 45,
    nextMilestone: 'Complete source verification',
    resources: [
      {
        id: 'resource-1',
        title: 'Infrastructure Investigation Draft',
        description:
          'Working article draft outlining the investigation and its central findings.',
        type: 'article',
        updatedAt: '2026-11-12T14:30:00',
        updatedBy: 'Jordan Mitchell',
        status: 'in-progress',
      },
      {
        id: 'resource-2',
        title: 'Public Spending Research Notes',
        description:
          'Background research, public records, and relevant infrastructure spending reports.',
        type: 'research',
        updatedAt: '2026-11-11T16:15:00',
        updatedBy: 'Taylor Brooks',
        status: 'ready',
      },
      {
        id: 'resource-3',
        title: 'Municipal Contract Records',
        description:
          'Government contract documents collected for review and comparison.',
        type: 'evidence',
        updatedAt: '2026-11-10T11:20:00',
        updatedBy: 'Morgan Ellis',
        status: 'needs-review',
      },
      {
        id: 'resource-4',
        title: 'Investigation Outline',
        description:
          'Project objectives, investigative questions, and assigned research responsibilities.',
        type: 'document',
        updatedAt: '2026-11-09T13:00:00',
        updatedBy: 'Jordan Mitchell',
        status: 'ready',
      },
    ],
  },
  {
    id: 'workspace-2',
    collaborationId: 'collab-2',
    summary:
      'Research into healthcare affordability and access disparities using public data, verified sources, and financial reporting.',
    stage: 'drafting',
    progress: 68,
    nextMilestone: 'Review the first article draft',
    resources: [
      {
        id: 'resource-5',
        title: 'Healthcare Access Research',
        description:
          'Research covering healthcare affordability, access barriers, and patient experiences.',
        type: 'research',
        updatedAt: '2026-11-12T10:00:00',
        updatedBy: 'Jordan Mitchell',
        status: 'ready',
      },
      {
        id: 'resource-6',
        title: 'Healthcare Cost Analysis',
        description:
          'Shared analysis of healthcare costs and supporting financial research.',
        type: 'document',
        updatedAt: '2026-11-11T13:45:00',
        updatedBy: 'Taylor Brooks',
        status: 'in-progress',
      },
      {
        id: 'resource-7',
        title: 'Healthcare Access Article',
        description:
          'Collaborative article draft examining healthcare affordability and access disparities.',
        type: 'article',
        updatedAt: '2026-11-10T09:20:00',
        updatedBy: 'Jordan Mitchell',
        status: 'needs-review',
      },
      {
        id: 'resource-8',
        title: 'Healthcare Policy References',
        description:
          'Supporting policy documents and source materials for editorial verification.',
        type: 'evidence',
        updatedAt: '2026-11-08T15:30:00',
        updatedBy: 'Taylor Brooks',
        status: 'ready',
      },
    ],
  },
  {
    id: 'workspace-3',
    collaborationId: 'collab-3',
    summary:
      'A shared article examining consumer privacy protections, digital rights, and emerging concerns surrounding personal data.',
    stage: 'review',
    progress: 88,
    nextMilestone: 'Finalize editorial review',
    resources: [
      {
        id: 'resource-9',
        title: 'Digital Privacy Article Draft',
        description:
          'Shared article draft covering consumer privacy protections and digital rights.',
        type: 'article',
        updatedAt: '2026-11-12T09:30:00',
        updatedBy: 'Jordan Mitchell',
        status: 'needs-review',
      },
      {
        id: 'resource-10',
        title: 'Privacy Policy Source Collection',
        description:
          'Reference materials and source documents supporting the investigation.',
        type: 'evidence',
        updatedAt: '2026-11-10T15:10:00',
        updatedBy: 'Morgan Ellis',
        status: 'ready',
      },
      {
        id: 'resource-11',
        title: 'Consumer Data Research',
        description:
          'Research into data collection, consent practices, and consumer privacy concerns.',
        type: 'research',
        updatedAt: '2026-11-09T11:45:00',
        updatedBy: 'Jordan Mitchell',
        status: 'ready',
      },
      {
        id: 'resource-12',
        title: 'Editorial Review Notes',
        description:
          'Feedback, suggested revisions, and outstanding editorial questions.',
        type: 'document',
        updatedAt: '2026-11-12T12:15:00',
        updatedBy: 'Morgan Ellis',
        status: 'in-progress',
      },
    ],
  },
]
