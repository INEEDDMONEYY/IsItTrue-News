export type VideoStudioStatus =
  | 'draft'
  | 'uploading'
  | 'processing'
  | 'ready'
  | 'submitted'
  | 'published'
  | 'rejected'

export type VideoStudioSection =
  | 'media'
  | 'edit'
  | 'captions'
  | 'metadata'
  | 'publishing'

export interface VideoSource {
  fileName: string
  fileUrl: string
  mimeType: string
  fileSize: number
  duration: number
  width?: number
  height?: number
}

export interface VideoTrim {
  start: number
  end: number
}

export interface VideoCaption {
  id: string
  startTime: number
  endTime: number
  text: string
}

export interface VideoMetadata {
  title: string
  description: string
  category: string
  tags: string[]
  location?: string
  recordedAt?: string
  credit?: string
  relatedArticleId?: string
  relatedInvestigationId?: string
  relatedCaseFileId?: string
}

export interface VideoStudioProject {
  id: string
  status: VideoStudioStatus
  activeSection: VideoStudioSection

  source?: VideoSource

  thumbnailUrl?: string

  trim: VideoTrim

  metadata: VideoMetadata

  captions: VideoCaption[]

  createdAt: string
  updatedAt: string
}