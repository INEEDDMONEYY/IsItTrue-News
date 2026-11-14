
import {
  Activity,
  Compass,
  LayoutDashboard,
  MessageSquare,
  Send,
  Users,
} from 'lucide-react'

import type { CollaborationTab } from '../../types/collaboration.types'

interface CollaborationTabsProps {
  activeTab: CollaborationTab
  onChange: (tab: CollaborationTab) => void
}

const tabs: {
  id: CollaborationTab
  label: string
  icon: typeof LayoutDashboard
}[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'discover', label: 'Discover', icon: Compass },
  { id: 'requests', label: 'Requests', icon: Send },
  { id: 'workspaces', label: 'Workspaces', icon: Users },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'activity', label: 'Activity', icon: Activity },
]

export function CollaborationTabs({
  activeTab,
  onChange,
}: CollaborationTabsProps) {
  return (
    <nav
      aria-label="Collaboration sections"
      className="mb-8 -mx-4 overflow-x-auto border-b border-[var(--color-border)] px-4 sm:mx-0 sm:px-0"
    >
      <div className="flex min-w-max gap-6 sm:gap-8">
        {tabs.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id

          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              aria-current={active ? 'page' : undefined}
              className={`relative flex items-center gap-2 border-b-2 pb-3 text-sm font-medium transition-colors ${
                active
                  ? 'border-[var(--color-accent)] text-[var(--color-heading)]'
                  : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-heading)]'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
