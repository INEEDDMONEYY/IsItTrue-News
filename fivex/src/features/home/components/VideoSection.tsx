import { Play } from 'lucide-react'

interface VideoItem {
  id: string
  title: string
  durationLabel: string
}

const MOCK_VIDEOS: VideoItem[] = [
  { id: 'v1', title: 'Inside the Committee Vote: What Happened', durationLabel: '4:12' },
  { id: 'v2', title: 'On the Ground: Reactions From the Public', durationLabel: '2:47' },
]

export function VideoSection({ videos = MOCK_VIDEOS }: { videos?: VideoItem[] }) {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-heading">Video</h3>
        <button className="text-sm text-accent hover:text-accent-hover transition-colors">
          See all
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {videos.map((video) => (
          <button
            key={video.id}
            className="group relative aspect-video rounded-2xl overflow-hidden border border-border bg-surface text-left"
          >
            <div className="absolute inset-0 bg-surface-2" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Play className="w-5 h-5 text-black ml-0.5" fill="black" />
              </div>
            </div>

            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
              <p className="text-sm text-white font-medium leading-snug pr-2 line-clamp-2">
                {video.title}
              </p>
              <span className="text-xs text-white/70 shrink-0">
                {video.durationLabel}
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}