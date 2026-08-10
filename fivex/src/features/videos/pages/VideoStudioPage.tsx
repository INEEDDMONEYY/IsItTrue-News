import { ArrowLeft, Save, Send } from 'lucide-react'
import { Link } from 'react-router-dom'

import VideoEditor from '@/features/videos/components/VideoEditor'
import VideoMetadata from '@/features/videos/components/VideoMetadata'
import VideoPlayer from '@/features/videos/components/VideoPlayer'
import VideoStudioSidebar from '@/features/videos/components/VideoStudioSidebar'
import VideoUploader from '@/features/videos/components/VideoUploader'

import { useVideoStudio } from '@/features/videos/hooks/useVideoStudio'

import type {
  VideoStudioProject,
} from '@/features/videos/types/videoStudio.types'

const mockProject: VideoStudioProject = {
  id: 'video-project-001',
  status: 'draft',
  activeSection: 'media',
  trim: {
    start: 0,
    end: 180,
  },
  metadata: {
    title: '',
    description: '',
    category: '',
    tags: [],
  },
  captions: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

export default function VideoStudioPage() {
  const {
    project,
    activeSection,
    isDirty,
    setProject,
    updateProject,
    changeSection,
  } = useVideoStudio(mockProject)

  if (!project) {
    return null
  }

  const handleFileSelected = (file: File) => {
    const url = URL.createObjectURL(file)

    updateProject({
      source: {
        fileName: file.name,
        fileUrl: url,
        mimeType: file.type,
        fileSize: file.size,
        duration: project.source?.duration ?? 0,
      },
      status: 'uploading',
    })
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Link
            to="/dashboard/videos"
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to My Videos
          </Link>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Video Studio
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Upload, edit, caption, and prepare your video for
            editorial review.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <Save className="h-4 w-4" />
            Save Draft
          </button>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            <Send className="h-4 w-4" />
            Submit for Review
          </button>
        </div>
      </div>

      {isDirty && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          You have unsaved changes.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <VideoStudioSidebar
          activeSection={activeSection}
          onSectionChange={changeSection}
        />

        <main className="space-y-6">
          <VideoPlayer
            src={project.source?.fileUrl}
            poster={project.thumbnailUrl}
          />

          {activeSection === 'media' && (
            <VideoUploader
              onFileSelected={handleFileSelected}
            />
          )}

          {activeSection === 'edit' && (
            <VideoEditor
              trim={project.trim}
              duration={project.source?.duration ?? 180}
              onChange={(trim) =>
                updateProject({ trim })
              }
            />
          )}

          {activeSection === 'metadata' && (
            <VideoMetadata
              metadata={project.metadata}
              onChange={(metadata) =>
                updateProject({
                  metadata: {
                    ...project.metadata,
                    ...metadata,
                  },
                })
              }
            />
          )}

          {activeSection === 'captions' && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">
                Captions
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Caption editing will be available here.
              </p>
            </div>
          )}

          {activeSection === 'publishing' && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">
                Publishing
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Review your video details before submitting it to
                the editorial workflow.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}