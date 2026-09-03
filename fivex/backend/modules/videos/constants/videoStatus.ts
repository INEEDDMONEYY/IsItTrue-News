// Videos have no editorial review gate — an author (or editor) publishes
// their own video directly, the same way articles work.
export const VIDEO_STATUSES = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
} as const

export type VideoStatus = (typeof VIDEO_STATUSES)[keyof typeof VIDEO_STATUSES]

export const ALL_VIDEO_STATUSES: VideoStatus[] = Object.values(VIDEO_STATUSES)

export const VIDEO_VISIBILITIES = ['public', 'unlisted', 'private'] as const
export type VideoVisibility = (typeof VIDEO_VISIBILITIES)[number]
