import { Scissors } from 'lucide-react'

import type { VideoTrim } from '@/features/videos/types/videoStudio.types'

interface VideoEditorProps {
  trim: VideoTrim
  duration: number
  onChange: (trim: VideoTrim) => void
}

export default function VideoEditor({
  trim,
  duration,
  onChange,
}: VideoEditorProps) {
  const safeDuration = Math.max(duration, 1)

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
          <Scissors className="h-5 w-5" />
        </div>

        <div>
          <h2 className="font-semibold text-slate-900">
            Video Editor
          </h2>

          <p className="text-sm text-slate-500">
            Trim the beginning or end of your video.
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-slate-50 p-5">
        <div className="mb-4 flex items-center justify-between text-sm">
          <span className="font-medium text-slate-700">
            Start: {trim.start.toFixed(1)}s
          </span>

          <span className="font-medium text-slate-700">
            End: {trim.end.toFixed(1)}s
          </span>
        </div>

        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Start
            </label>

            <input
              type="range"
              min={0}
              max={safeDuration}
              step={0.1}
              value={trim.start}
              onChange={(event) =>
                onChange({
                  ...trim,
                  start: Math.min(
                    Number(event.target.value),
                    trim.end,
                  ),
                })
              }
              className="w-full"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">
              End
            </label>

            <input
              type="range"
              min={0}
              max={safeDuration}
              step={0.1}
              value={trim.end}
              onChange={(event) =>
                onChange({
                  ...trim,
                  end: Math.max(
                    Number(event.target.value),
                    trim.start,
                  ),
                })
              }
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  )
}