import type { VideoStudioProject } from '@/features/videos/types/videoStudio.types'

export const videoStudioService = {
  async getProject(projectId: string): Promise<VideoStudioProject> {
    throw new Error(
      `Video Studio project ${projectId} is not connected to the API yet.`,
    )
  },

  async saveProject(
    project: VideoStudioProject,
  ): Promise<VideoStudioProject> {
    throw new Error(
      `Video Studio project ${project.id} is not connected to the API yet.`,
    )
  },

  async submitForReview(
    projectId: string,
  ): Promise<VideoStudioProject> {
    throw new Error(
      `Video Studio project ${projectId} is not connected to the API yet.`,
    )
  },
}