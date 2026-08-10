import { useMemo, useState } from 'react'
import { mockMyVideos } from '@/features/videos/data/mockMyVideos'
import type {
  MyVideo,
  MyVideoStatus,
} from '@/features/videos/types/myVideo.types'

export type MyVideoFilter = 'all' | MyVideoStatus

export function useMyVideos() {
  const [filter, setFilter] = useState<MyVideoFilter>('all')
  const [search, setSearch] = useState('')

  const videos = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return mockMyVideos.filter((video: MyVideo) => {
      const matchesStatus =
        filter === 'all' || video.status === filter

      const matchesSearch =
        !normalizedSearch ||
        video.title.toLowerCase().includes(normalizedSearch) ||
        video.category.toLowerCase().includes(normalizedSearch)

      return matchesStatus && matchesSearch
    })
  }, [filter, search])

  const stats = useMemo(() => {
    return {
      total: mockMyVideos.length,
      published: mockMyVideos.filter(
        (video) => video.status === 'published',
      ).length,
      underReview: mockMyVideos.filter(
        (video) => video.status === 'under_review',
      ).length,
      drafts: mockMyVideos.filter(
        (video) => video.status === 'draft',
      ).length,
      totalViews: mockMyVideos.reduce(
        (total, video) => total + video.views,
        0,
      ),
      totalLikes: mockMyVideos.reduce(
        (total, video) => total + video.likes,
        0,
      ),
      totalComments: mockMyVideos.reduce(
        (total, video) => total + video.comments,
        0,
      ),
    }
  }, [])

  return {
    videos,
    stats,
    filter,
    setFilter,
    search,
    setSearch,
  }
}