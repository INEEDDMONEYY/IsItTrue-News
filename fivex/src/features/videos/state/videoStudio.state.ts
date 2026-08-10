import type {
  VideoStudioProject,
  VideoStudioSection,
} from '@/features/videos/types/videoStudio.types'

export interface VideoStudioState {
  project: VideoStudioProject | null
  activeSection: VideoStudioSection
  isDirty: boolean
  isSaving: boolean
}

export const initialVideoStudioState: VideoStudioState = {
  project: null,
  activeSection: 'media',
  isDirty: false,
  isSaving: false,
}