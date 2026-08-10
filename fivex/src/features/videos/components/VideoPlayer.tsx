import { useState } from 'react'
import { Maximize, Pause, Play, Volume2 } from 'lucide-react'

interface VideoPlayerProps {
  src?: string
  poster?: string
}

export default function VideoPlayer({
  src,
  poster,
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-sm">
      <div className="relative aspect-video">
        {src ? (
          <video
            src={src}
            poster={poster}
            controls
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
                <Play className="h-6 w-6 text-white" />
              </div>

              <p className="text-sm font-medium text-slate-300">
                Video preview
              </p>
            </div>
          </div>
        )}

        {!src && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Play video"
                onClick={() => setIsPlaying((value) => !value)}
                className="pointer-events-auto rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </button>

              <Volume2 className="h-4 w-4 text-slate-300" />
            </div>

            <Maximize className="h-4 w-4 text-slate-300" />
          </div>
        )}
      </div>
    </div>
  )
}