// Shape of the public, read-only author profile endpoints
// (/api/users/:id/profile, /api/videos/author/:id) — real backend documents,
// not the mock author types used elsewhere in the dashboard.

export interface PublicAuthorSocialLinks {
  twitter?: string
  linkedin?: string
  instagram?: string
}

export interface PublicAuthorInfo {
  id: string
  name: string
  role: string
  followersCount: number
  authorProfile?: {
    professionalName?: string
    bio?: string
    location?: string
    website?: string
    profileImage?: string
    bannerImage?: string
    socialLinks?: PublicAuthorSocialLinks
    primaryBeats?: string[]
    secondaryBeats?: string[]
    areasOfExpertise?: string[]
    geographicCoverage?: string[]
    yearsOfExperience?: number
  }
}

export interface PublicAuthorStats {
  articles: number
  videos: number
  factChecksVerified: number
}

export interface PublicAuthorProfileResponse {
  user: PublicAuthorInfo
  isFollowing: boolean
  stats: PublicAuthorStats
}

export interface PublicAuthorVideo {
  id: string
  title: string
  thumbnailUrl?: string
  duration: number
  views: number
  likes: number
  publishedAt?: string
  createdAt: string
}

export interface PublicLibraryItem {
  id: string
  type: 'article' | 'video' | 'comment'
  title: string
  excerpt?: string
  thumbnailUrl?: string
  href: string
  createdAt: string
}
