export type MyVideoStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'published'
  | 'revision_requested'
  | 'rejected'

export type MyVideoVisibility = 'public' | 'unlisted' | 'private'

export interface MyVideo {
  id: string
  title: string
  description: string
  thumbnailUrl: string
  category: string
  status: MyVideoStatus
  visibility: MyVideoVisibility
  duration: number
  views: number
  likes: number
  comments: number
  publishedAt?: string
  updatedAt: string
  createdAt: string
}