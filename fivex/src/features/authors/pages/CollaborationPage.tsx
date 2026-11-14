
import { useState } from 'react'
import {
  Activity,
  ArrowRight,
  Bell,
  BookOpen,
  Clock3,
  FileSearch,
  FolderKanban,
  MessageSquare,
  Plus,
  Users,
  UserPen,
} from 'lucide-react'

import { PaywallGate } from '@/features/billing/components/PaywallGate'

import { CollaborationTabs } from '../components/collaboration/CollaborationTabs'
import { DiscoverAuthors } from '../components/collaboration/DiscoverAuthors'
import { CollaborationRequests } from '../components/collaboration/CollaborationRequests'
import { CollaborationWorkspaces } from '../components/collaboration/CollaborationWorkspaces'
import { CollaborationMessages } from '../components/collaboration/CollaborationMessages'
import { CollaborationActivity } from '../components/collaboration/CollaborationActivity'

import {
  mockCollaborationActivity,
  mockCollaborations,
  mockCollaborationStats,
} from '../data/mockCollaborations'

import type {
  Collaboration,
  CollaborationTab,
} from '../types/collaboration.types'

const statCards = [
  {
    label: 'Active collaborations',
    value: mockCollaborationStats.activeCollaborations,
    icon: Users,
    description: 'Projects you are working on',
  },
  {
    label: 'Pending requests',
    value: mockCollaborationStats.pendingRequests,
    icon: Clock3,
    description: 'Requests awaiting a response',
  },
  {
    label: 'Invitations',
    value: mockCollaborationStats.invitations,
    icon: Bell,
    description: 'Invitations from other authors',
  },
  {
    label: 'Unread messages',
    value: mockCollaborationStats.unreadMessages,
    icon: MessageSquare,
    description: 'Messages across your projects',
  },
]

const projectIcons = {
  article: BookOpen,
  investigation: FileSearch,
  research: FolderKanban,
}

const projectLabels = {
  article: 'Article',
  investigation: 'Investigation',
  research: 'Research',
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function formatDate(date: string) {
  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) return date

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(parsedDate)
}

function CollaboratorAvatars({
  collaboration,
}: {
  collaboration: Collaboration
}) {
  const visible = collaboration.collaborators.slice(0, 3)

  return (
    <div className="flex items-center">
      {visible.map((author, index) => (
        <div
          key={author.id}
          title={author.name}
          className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--color-surface)] bg-[var(--color-accent)]/10 text-[10px] font-semibold text-[var(--color-heading)] ${
            index > 0 ? '-ml-2' : ''
          }`}
        >
          {getInitials(author.name)}
        </div>
      ))}

      {collaboration.collaborators.length > 3 && (
        <div className="-ml-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--color-surface)] bg-[var(--color-surface-muted)] text-[10px] font-semibold text-[var(--color-text-muted)]">
          +{collaboration.collaborators.length - 3}
        </div>
      )}
    </div>
  )
}

function CollaborationProjectCard({
  collaboration,
}: {
  collaboration: Collaboration
}) {
  const Icon = projectIcons[collaboration.type]

  return (
    <article className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition-colors hover:border-[var(--color-accent)]/40 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
          <Icon size={21} />
        </div>

        <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600">
          Active
        </span>
      </div>

      <div className="mt-5">
        <p className="text-xs font-medium text-[var(--color-text-muted)]">
          {projectLabels[collaboration.type]}
        </p>

        <h3 className="mt-1 text-base font-semibold leading-6 text-[var(--color-heading)]">
          {collaboration.title}
        </h3>

        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--color-text-muted)]">
          {collaboration.description}
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-[var(--color-border)] pt-4">
        <div className="flex min-w-0 items-center gap-3">
          <CollaboratorAvatars collaboration={collaboration} />
          <span className="truncate text-xs text-[var(--color-text-muted)]">
            {collaboration.collaborators.length} collaborators
          </span>
        </div>

        <span className="shrink-0 text-xs text-[var(--color-text-muted)]">
          {formatDate(collaboration.updatedAt)}
        </span>
      </div>

      {collaboration.unreadMessages > 0 && (
        <div className="mt-4 flex items-center gap-2 text-xs font-medium text-[var(--color-accent)]">
          <MessageSquare size={14} />
          {collaboration.unreadMessages} unread messages
        </div>
      )}
    </article>
  )
}

function CollaborationOverview({
  onNavigate,
}: {
  onNavigate: (tab: CollaborationTab) => void
}) {
  return (
    <div className="space-y-8">
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-[var(--color-heading)]">
            Your workspace
          </h2>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            An overview of your collaborative work.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map(({ label, value, icon: Icon, description }) => (
            <div
              key={label}
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-[var(--color-text-muted)]">
                  {label}
                </span>
                <Icon
                  size={18}
                  className="shrink-0 text-[var(--color-accent)]"
                />
              </div>

              <p className="mt-4 text-3xl font-bold tracking-tight text-[var(--color-heading)]">
                {value}
              </p>

              <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-heading)]">
              Active collaborations
            </h2>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Projects you are currently working on with other authors.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('workspaces')}
            className="hidden items-center gap-2 text-sm font-medium text-[var(--color-accent)] hover:opacity-80 sm:flex"
          >
            View all
            <ArrowRight size={15} />
          </button>
        </div>

        {mockCollaborations.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {mockCollaborations.map((collaboration) => (
              <CollaborationProjectCard
                key={collaboration.id}
                collaboration={collaboration}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[var(--color-border)] p-10 text-center">
            <FolderKanban
              size={28}
              className="mx-auto text-[var(--color-text-muted)]"
            />
            <h3 className="mt-3 font-semibold text-[var(--color-heading)]">
              No active collaborations
            </h3>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Your shared projects will appear here.
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={() => onNavigate('workspaces')}
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-accent)] sm:hidden"
        >
          View all workspaces
          <ArrowRight size={15} />
        </button>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-[var(--color-heading)]">
                Recent activity
              </h2>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                Latest updates from your shared projects.
              </p>
            </div>

            <Activity size={18} className="shrink-0 text-[var(--color-accent)]" />
          </div>

          <div className="space-y-5">
            {mockCollaborationActivity.slice(0, 3).map((item) => (
              <div key={item.id} className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)]/10 text-xs font-semibold text-[var(--color-accent)]">
                  {getInitials(item.author.name)}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-5 text-[var(--color-heading)]">
                    <span className="font-semibold">{item.author.name}</span>{' '}
                    <span className="text-[var(--color-text-muted)]">
                      {item.action}
                    </span>{' '}
                    <span className="font-medium">{item.target}</span>
                  </p>

                  <p className="mt-1 truncate text-xs text-[var(--color-text-muted)]">
                    {item.projectTitle}
                  </p>

                  <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                    {formatDate(item.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => onNavigate('activity')}
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-accent)] hover:opacity-80"
          >
            View all activity
            <ArrowRight size={15} />
          </button>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
              <UserPen size={20} />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-[var(--color-heading)]">
              Build something together
            </h2>

            <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--color-text-muted)]">
              Connect with journalists, researchers, and fact-checkers who
              share your interests. Great investigations start with
              collaboration.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('discover')}
            className="mt-6 inline-flex w-fit items-center gap-2 rounded-xl bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            <Plus size={16} />
            Discover authors
          </button>
        </div>
      </section>
    </div>
  )
}

export function CollaborationPage() {
  const [activeTab, setActiveTab] = useState<CollaborationTab>('overview')

  return (
    <PaywallGate feature="collaboration">
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold text-[var(--color-accent)]">
              Author Workspace
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--color-heading)] sm:text-4xl">
              Collaboration Room
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">
              Work alongside fellow journalists, researchers, and
              fact-checkers on shared stories and investigations.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('discover')}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 sm:w-auto"
          >
            <Plus size={17} />
            Find collaborators
          </button>
        </header>

        <CollaborationTabs
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        <div className="mt-6">
          {activeTab === 'overview' && (
            <CollaborationOverview onNavigate={setActiveTab} />
          )}

          {activeTab === 'discover' && <DiscoverAuthors />}

          {activeTab === 'requests' && <CollaborationRequests />}

          {activeTab === 'workspaces' && <CollaborationWorkspaces />}

          {activeTab === 'messages' && <CollaborationMessages />}

          {activeTab === 'activity' && <CollaborationActivity />}
        </div>
      </main>
    </PaywallGate>
  )
}
