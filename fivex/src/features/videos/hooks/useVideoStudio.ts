import { useCallback, useState } from 'react'

import type {
  VideoStudioProject,
  VideoStudioSection,
} from '@/features/videos/types/videoStudio.types'

import { initialVideoStudioState } from '@/features/videos/state/videoStudio.state'

export function useVideoStudio(
  initialProject?: VideoStudioProject | null,
) {
  const [project, setProject] = useState<VideoStudioProject | null>(
    initialProject ?? null,
  )

  const [activeSection, setActiveSection] =
    useState<VideoStudioSection>(
      initialProject?.activeSection ??
        initialVideoStudioState.activeSection,
    )

  const [isDirty, setIsDirty] = useState(false)

  const updateProject = useCallback(
    (updates: Partial<VideoStudioProject>) => {
      setProject((current) =>
        current
          ? {
              ...current,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : current,
      )

      setIsDirty(true)
    },
    [],
  )

  const changeSection = useCallback(
    (section: VideoStudioSection) => {
      setActiveSection(section)
      setProject((current) =>
        current
          ? {
              ...current,
              activeSection: section,
            }
          : current,
      )
    },
    [],
  )

  return {
    project,
    activeSection,
    isDirty,
    setProject,
    updateProject,
    changeSection,
  }
}