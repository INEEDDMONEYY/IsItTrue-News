
import { useNavigate } from 'react-router-dom'
import { Video, Upload } from 'lucide-react'

import { MyVideoCard } from '@/features/videos/components/MyVideoCard'
import { MyVideoStats } from '@/features/videos/components/MyVideoStats'
import { MyVideoToolbar } from '@/features/videos/components/MyVideoToolbar'
import { useMyVideos } from '@/features/videos/hooks/useMyVideos'

export function MyVideosPage() {
  const navigate = useNavigate()

  const {
    videos,
    stats,
    filter,
    setFilter,
    search,
    setSearch,
  } = useMyVideos()

  const handleUpload = () => {
    navigate('/dashboard/videos/studio')
  }

  const handleOpen = (video: (typeof videos)[number]) => {
    navigate(`/dashboard/videos/${video.id}`)
  }

  const handleEdit = (video: (typeof videos)[number]) => {
    navigate(`/dashboard/videos/${video.id}/edit`)
  }

  return (
    <main className="space-y-8">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 text-[var(--color-accent)]">
            <Video className="h-4 w-4" />

            <span className="text-sm font-semibold">
              Author Studio
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-[var(--color-heading)]">
            My Videos
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">
            Manage your videos, track engagement, and monitor
            the publication status of your work.
          </p>
        </div>

        <button
          type="button"
          onClick={handleUpload}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-hover)]"
        >
          <Upload className="h-4 w-4" />
          Upload Video
        </button>
      </header>

      <MyVideoStats stats={stats} />

      <MyVideoToolbar
        filter={filter}
        onFilterChange={setFilter}
        search={search}
        onSearchChange={setSearch}
      />

      {videos.length > 0 ? (
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {videos.map((video) => (
            <MyVideoCard
              key={video.id}
              video={video}
              onOpen={handleOpen}
              onEdit={handleEdit}
            />
          ))}
        </section>
      ) : (
        <section className="rounded-2xl border border-dashed border-[var(--color-card-border)] bg-[var(--color-card)] px-6 py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-accent-bg)] text-[var(--color-accent)]">
            <Video className="h-7 w-7" />
          </div>

          <h2 className="mt-5 text-lg font-bold text-[var(--color-card-heading)]">
            No videos found
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--color-card-text-muted)]">
            Try changing your search or filter, or upload
            your first video to begin building your library.
          </p>
        </section>
      )}
    </main>
  )
}

