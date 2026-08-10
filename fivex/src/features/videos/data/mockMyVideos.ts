import caitlinClarkImage from '@/assets/images/caitlin-clark.png'
import powerImage from '@/assets/images/power.png'
import sameBloodImage from '@/assets/images/same-blood.png'
import speakUpImage from '@/assets/images/speak-up.jpg'
import timeToMoveImage from '@/assets/images/time-to-move.jpg'

import type { MyVideo } from '@/features/videos/types/myVideo.types'

export const mockMyVideos: MyVideo[] = [
  {
    id: 'video-001',
    title: 'What the Latest Evidence Actually Shows',
    description:
      'A breakdown of the evidence behind a widely circulated claim.',
    thumbnailUrl: speakUpImage,
    category: 'Investigations',
    status: 'published',
    visibility: 'public',
    duration: 428,
    views: 12480,
    likes: 842,
    comments: 96,
    publishedAt: '2026-07-28T14:30:00Z',
    updatedAt: '2026-07-28T14:30:00Z',
    createdAt: '2026-07-24T09:15:00Z',
  },
  {
    id: 'video-002',
    title: 'Inside the Case File',
    description:
      'A visual walkthrough of the documents and sources behind an investigation.',
    thumbnailUrl: powerImage,
    category: 'Case Files',
    status: 'published',
    visibility: 'public',
    duration: 612,
    views: 8940,
    likes: 611,
    comments: 71,
    publishedAt: '2026-07-19T16:00:00Z',
    updatedAt: '2026-07-19T16:00:00Z',
    createdAt: '2026-07-15T11:20:00Z',
  },
  {
    id: 'video-003',
    title: 'How We Verify a Source',
    description:
      'An explanation of the verification process used before publication.',
    thumbnailUrl: timeToMoveImage,
    category: 'Behind the Story',
    status: 'under_review',
    visibility: 'private',
    duration: 356,
    views: 0,
    likes: 0,
    comments: 0,
    updatedAt: '2026-08-02T13:45:00Z',
    createdAt: '2026-08-01T10:30:00Z',
  },
  {
    id: 'video-004',
    title: 'The Story Behind the Investigation',
    description:
      'The reporting process, sources, and discoveries behind a developing investigation.',
    thumbnailUrl: sameBloodImage,
    category: 'Investigations',
    status: 'draft',
    visibility: 'private',
    duration: 284,
    views: 0,
    likes: 0,
    comments: 0,
    updatedAt: '2026-08-05T18:10:00Z',
    createdAt: '2026-08-04T15:40:00Z',
  },
  {
    id: 'video-005',
    title: 'Corrections Matter',
    description:
      'Why transparent corrections are an important part of responsible journalism.',
    thumbnailUrl: caitlinClarkImage,
    category: 'Editorial',
    status: 'revision_requested',
    visibility: 'private',
    duration: 319,
    views: 0,
    likes: 0,
    comments: 0,
    updatedAt: '2026-08-06T12:20:00Z',
    createdAt: '2026-08-03T09:00:00Z',
  },
]