export type MediaResourceType = 'image' | 'video'

export interface Media {
  id: string
  url: string
  publicId: string
  resourceType: MediaResourceType
  format: string
  bytes: number
  width?: number
  height?: number
  duration?: number
  createdAt: string
}
