import { Media, type MediaDocument, type MediaResourceType } from '../models/Media.js'

export interface CreateMediaData {
  url: string
  publicId: string
  resourceType: MediaResourceType
  format: string
  bytes: number
  width?: number
  height?: number
  duration?: number
  uploadedBy: string
}

export const mediaRepository = {
  create(input: CreateMediaData): Promise<MediaDocument> {
    return Media.create(input)
  },

  findById(id: string): Promise<MediaDocument | null> {
    return Media.findById(id)
  },

  deleteById(id: string): Promise<MediaDocument | null> {
    return Media.findByIdAndDelete(id)
  },
}
