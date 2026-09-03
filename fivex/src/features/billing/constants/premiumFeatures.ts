import {
  BarChart3,
  BriefcaseBusiness,
  FolderLock,
  PencilLine,
  Target,
  UserPen,
  type LucideIcon,
} from 'lucide-react'

export type PremiumFeatureKey =
  | 'drafts'
  | 'pitchCenter'
  | 'collaboration'
  | 'evidenceVault'
  | 'investigations'
  | 'analytics'

export interface PremiumFeatureMeta {
  key: PremiumFeatureKey
  label: string
  description: string
  icon: LucideIcon
}

export const PREMIUM_FEATURES: Record<PremiumFeatureKey, PremiumFeatureMeta> = {
  drafts: {
    key: 'drafts',
    label: 'My Drafts',
    description:
      'Manage your stories from early research through collaboration, fact-checking, revisions, and editorial submission.',
    icon: PencilLine,
  },
  pitchCenter: {
    key: 'pitchCenter',
    label: 'Pitch Center',
    description:
      'Propose story ideas to editors and track their status before you start writing.',
    icon: Target,
  },
  collaboration: {
    key: 'collaboration',
    label: 'Collaboration Room',
    description:
      'Work alongside co-authors, editors, and fact-checkers on shared stories in real time.',
    icon: UserPen,
  },
  evidenceVault: {
    key: 'evidenceVault',
    label: 'Evidence Vault',
    description:
      'Securely store and organize source documents, recordings, and supporting evidence.',
    icon: FolderLock,
  },
  investigations: {
    key: 'investigations',
    label: 'My Investigations',
    description:
      'Track long-form investigative projects from lead to publication.',
    icon: BriefcaseBusiness,
  },
  analytics: {
    key: 'analytics',
    label: 'Analytics',
    description:
      'Deep performance insights across every article and video you publish.',
    icon: BarChart3,
  },
}
