import {
  Captions,
  FileText,
  Film,
  Settings2,
  Upload,
} from 'lucide-react'

import type { VideoStudioSection } from '@/features/videos/types/videoStudio.types'

interface VideoStudioSidebarProps {
  activeSection: VideoStudioSection
  onSectionChange: (section: VideoStudioSection) => void
}

const sections = [
  {
    id: 'media' as const,
    label: 'Media',
    icon: Upload,
  },
  {
    id: 'edit' as const,
    label: 'Edit',
    icon: Film,
  },
  {
    id: 'captions' as const,
    label: 'Captions',
    icon: Captions,
  },
  {
    id: 'metadata' as const,
    label: 'Metadata',
    icon: FileText,
  },
  {
    id: 'publishing' as const,
    label: 'Publishing',
    icon: Settings2,
  },
]

export default function VideoStudioSidebar({
  activeSection,
  onSectionChange,
}: VideoStudioSidebarProps) {
  return (
    <aside className="rounded-2xl border border-border bg-card p-3 shadow-sm">
      <div className="mb-3 px-3 py-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          Video Studio
        </p>
      </div>

      <nav className="space-y-1">
        {sections.map((section) => {
          const Icon = section.icon
          const active = activeSection === section.id

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onSectionChange(section.id)}
              className={[
                'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition',
                active
                  ? 'bg-brand-gradient text-on-brand'
                  : 'text-text-muted hover:bg-surface-2 hover:text-heading',
              ].join(' ')}
            >
              <Icon className="h-4 w-4" />
              {section.label}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}