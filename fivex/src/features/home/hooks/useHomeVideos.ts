import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/api/client'

export interface HomeVideo {
  id: string
  title: string
  durationLabel: string
}

interface ApiVideo {
  id: string
  title: string
  duration: number
}

// Video duration is stored in seconds.
function formatDuration(totalSeconds: number) {
  const seconds = Math.max(0, Math.round(totalSeconds))
  const minutes = Math.floor(seconds / 60)
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`
}

const HOME_VIDEO_COUNT = 2

export function useHomeVideos() {
  const query = useQuery({
    queryKey: ['videos', 'home'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ videos: ApiVideo[] }>('/api/videos')
      return data.videos
    },
    select: (videos): HomeVideo[] =>
      videos.slice(0, HOME_VIDEO_COUNT).map((video) => ({
        id: video.id,
        title: video.title,
        durationLabel: formatDuration(video.duration),
      })),
    staleTime: 60_000,
  })

  return { videos: query.data ?? [], isLoading: query.isLoading }
}
