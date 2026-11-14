
import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  FileText,
  FolderOpen,
  FolderSearch,
  MessageSquare,
  Search,
  ShieldCheck,
  Users,
} from 'lucide-react'

import { mockCollaborations } from '@/features/authors/data/mockCollaborations'
import { mockCollaborationWorkspaces } from '@/features/authors/data/mockCollaborationWorkspaces'
import type { Collaboration } from '@/features/authors/types/collaboration.types'
import type {
  CollaborationWorkspace,
  WorkspaceResource,
  WorkspaceResourceType,
  WorkspaceStage,
} from '@/features/authors/types/collaborationWorkspace.types'

type WorkspaceFilter = 'all' | WorkspaceStage

const stageLabels: Record<WorkspaceStage, string> = {
  planning: 'Planning',
  research: 'Research',
  drafting: 'Drafting',
  review: 'Editorial review',
  completed: 'Completed',
}

const stageStyles: Record<WorkspaceStage, string> = {
  planning:
    'border-slate-500/20 bg-slate-500/10 text-slate-600 dark:text-slate-300',
  research:
    'border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400',
  drafting:
    'border-violet-500/20 bg-violet-500/10 text-violet-600 dark:text-violet-400',
  review:
    'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400',
  completed:
    'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
}

const resourceLabels: Record<WorkspaceResourceType, string> = {
  article: 'Article',
  research: 'Research',
  evidence: 'Evidence',
  document: 'Document',
}

const resourceIcons = {
  article: FileText,
  research: BookOpen,
  evidence: ShieldCheck,
  document: FolderOpen,
}

const resourceStatusLabels = {
  'in-progress': 'In progress',
  ready: 'Ready',
  'needs-review': 'Needs review',
}

const resourceStatusStyles = {
  'in-progress':
    'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  ready:
    'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  'needs-review':
    'bg-amber-500/10 text-amber-600 dark:text-amber-400',
}

function formatDate(date: string) {
  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) {
    return date
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsedDate)
}

function getResourceCounts(resources: WorkspaceResource[]) {
  return {
    articles: resources.filter((item) => item.type === 'article').length,
    research: resources.filter((item) => item.type === 'research').length,
    evidence: resources.filter((item) => item.type === 'evidence').length,
    documents: resources.filter((item) => item.type === 'document').length,
  }
}

function WorkspaceStageBadge({ stage }: { stage: WorkspaceStage }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${stageStyles[stage]}`}
    >
      {stageLabels[stage]}
    </span>
  )
}

function CollaboratorAvatars({
  collaboration,
}: {
  collaboration: Collaboration
}) {
  const visibleCollaborators = collaboration.collaborators.slice(0, 3)
  const remaining = collaboration.collaborators.length - 3

  return (
    <div className="flex items-center">
      {visibleCollaborators.map((author, index) => (
        <div
          key={author.id}
          title={author.name}
          className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--color-surface)] bg-[var(--color-surface-muted)] text-[10px] font-semibold text-[var(--color-heading)] ${
            index > 0 ? '-ml-2' : ''
          }`}
        >
          {author.avatar ? (
            <img
              src={author.avatar}
              alt={author.name}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            author.name
              .split(' ')
              .map((part) => part[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()
          )}
        </div>
      ))}

      {remaining > 0 && (
        <span className="-ml-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--color-surface)] bg-[var(--color-surface-muted)] text-[10px] font-semibold text-[var(--color-text-muted)]">
          +{remaining}
        </span>
      )}
    </div>
  )
}

function WorkspaceProgress({ progress }: { progress: number }) {
  const safeProgress = Math.min(100, Math.max(0, progress))

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="text-[var(--color-text-muted)]">
          Project progress
        </span>
        <span className="font-semibold tabular-nums text-[var(--color-heading)]">
          {safeProgress}%
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-[var(--color-surface-muted)]">
        <div
          className="h-full rounded-full bg-[var(--color-accent)] transition-all"
          style={{ width: `${safeProgress}%` }}
        />
      </div>
    </div>
  )
}

function WorkspaceCard({
  workspace,
  collaboration,
  onOpen,
}: {
  workspace: CollaborationWorkspace
  collaboration: Collaboration
  onOpen: () => void
}) {
  const counts = getResourceCounts(workspace.resources)

  return (
    <article className="flex h-full flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm transition hover:border-[var(--color-accent)]/40">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-surface-muted)] text-[var(--color-accent)]">
          <FolderOpen className="h-5 w-5" />
        </div>

        <WorkspaceStageBadge stage={workspace.stage} />
      </div>

      <h3 className="mt-4 text-lg font-semibold leading-snug text-[var(--color-heading)]">
        {collaboration.title}
      </h3>

      <p className="mt-2 line-clamp-3 text-sm leading-6 text-[var(--color-text-muted)]">
        {workspace.summary}
      </p>

      <div className="mt-5">
        <WorkspaceProgress progress={workspace.progress} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-[var(--color-surface-muted)] p-3">
          <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
            <FileText className="h-3.5 w-3.5" />
            Articles
          </div>
          <p className="mt-1 text-lg font-semibold text-[var(--color-heading)]">
            {counts.articles}
          </p>
        </div>

        <div className="rounded-xl bg-[var(--color-surface-muted)] p-3">
          <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
            <ShieldCheck className="h-3.5 w-3.5" />
            Evidence
          </div>
          <p className="mt-1 text-lg font-semibold text-[var(--color-heading)]">
            {counts.evidence}
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-[var(--color-border)] pt-4">
        <div className="flex items-center gap-2">
          <CollaboratorAvatars collaboration={collaboration} />
          <span className="text-xs text-[var(--color-text-muted)]">
            {collaboration.collaborators.length} collaborators
          </span>
        </div>

        <button
          type="button"
          onClick={onOpen}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-accent)] transition hover:opacity-75"
        >
          Open workspace
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </article>
  )
}

function ResourceCard({ resource }: { resource: WorkspaceResource }) {
  const Icon = resourceIcons[resource.type]

  return (
    <article className="flex flex-col gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-surface-muted)] text-[var(--color-accent)]">
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-medium text-[var(--color-heading)]">
              {resource.title}
            </h4>
            <span className="rounded-md bg-[var(--color-surface-muted)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-text-muted)]">
              {resourceLabels[resource.type]}
            </span>
          </div>

          <p className="mt-1 text-sm leading-5 text-[var(--color-text-muted)]">
            {resource.description}
          </p>

          <p className="mt-2 text-xs text-[var(--color-text-muted)]">
            Updated by {resource.updatedBy} · {formatDate(resource.updatedAt)}
          </p>
        </div>
      </div>

      <span
        className={`inline-flex w-fit shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${resourceStatusStyles[resource.status]}`}
      >
        {resourceStatusLabels[resource.status]}
      </span>
    </article>
  )
}

function WorkspaceDetail({
  workspace,
  collaboration,
  onBack,
}: {
  workspace: CollaborationWorkspace
  collaboration: Collaboration
  onBack: () => void
}) {
  const [resourceFilter, setResourceFilter] = useState<
    'all' | WorkspaceResourceType
  >('all')

  const filteredResources = workspace.resources.filter(
    (resource) =>
      resourceFilter === 'all' || resource.type === resourceFilter,
  )

  const counts = getResourceCounts(workspace.resources)

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text-muted)] transition hover:text-[var(--color-heading)]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to workspaces
      </button>

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <WorkspaceStageBadge stage={workspace.stage} />
              <span className="text-xs text-[var(--color-text-muted)]">
                Updated {formatDate(collaboration.updatedAt)}
              </span>
            </div>

            <h2 className="mt-3 text-2xl font-bold tracking-tight text-[var(--color-heading)]">
              {collaboration.title}
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">
              {workspace.summary}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3 rounded-xl bg-[var(--color-surface-muted)] p-3">
            <CollaboratorAvatars collaboration={collaboration} />
            <div>
              <p className="text-sm font-semibold text-[var(--color-heading)]">
                {collaboration.collaborators.length} collaborators
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">
                Shared workspace
              </p>
            </div>
          </div>
        </div>

        <div className="mt-7 grid gap-5 border-t border-[var(--color-border)] pt-5 sm:grid-cols-2">
          <div>
            <WorkspaceProgress progress={workspace.progress} />
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-surface-muted)] text-[var(--color-accent)]">
              <Clock3 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)]">
                Next milestone
              </p>
              <p className="mt-1 text-sm font-medium text-[var(--color-heading)]">
                {workspace.nextMilestone}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[var(--color-heading)]">
              Shared materials
            </h3>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Documents, research, and evidence organized for this project.
            </p>
          </div>

          <span className="text-sm text-[var(--color-text-muted)]">
            {workspace.resources.length} items
          </span>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {(
            [
              ['all', 'All materials', workspace.resources.length],
              ['article', 'Articles', counts.articles],
              ['research', 'Research', counts.research],
              ['evidence', 'Evidence', counts.evidence],
              ['document', 'Documents', counts.documents],
            ] as const
          ).map(([value, label, count]) => (
            <button
              key={value}
              type="button"
              onClick={() => setResourceFilter(value)}
              className={`rounded-xl px-3 py-2 text-xs font-medium transition ${
                resourceFilter === value
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'border border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)]'
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>

        {filteredResources.length > 0 ? (
          <div className="space-y-3">
            {filteredResources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[var(--color-border)] p-8 text-center">
            <FolderSearch className="mx-auto h-8 w-8 text-[var(--color-text-muted)]" />
            <p className="mt-3 font-medium text-[var(--color-heading)]">
              No materials in this category
            </p>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Shared items in this category will appear here.
            </p>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)]/50 p-4">
        <div className="flex items-start gap-3">
          <Users className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-text-muted)]" />
          <div>
            <p className="text-sm font-medium text-[var(--color-heading)]">
              Collaboration workspace
            </p>
            <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)]">
              This is a frontend preview. Shared file uploads, document
              editing, permissions, and real-time synchronization will be
              connected through the backend.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function CollaborationWorkspaces() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<WorkspaceFilter>('all')
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(
    null,
  )

  const workspaceItems = useMemo(() => {
    return mockCollaborationWorkspaces
      .map((workspace) => ({
        workspace,
        collaboration: mockCollaborations.find(
          (item) => item.id === workspace.collaborationId,
        ),
      }))
      .filter(
        (
          item,
        ): item is {
          workspace: CollaborationWorkspace
          collaboration: Collaboration
        } => Boolean(item.collaboration),
      )
  }, [])

  const filteredWorkspaces = workspaceItems.filter(
    ({ workspace, collaboration }) => {
      const query = search.trim().toLowerCase()

      const matchesSearch =
        !query ||
        collaboration.title.toLowerCase().includes(query) ||
        workspace.summary.toLowerCase().includes(query) ||
        workspace.resources.some((resource) =>
          resource.title.toLowerCase().includes(query),
        )

      const matchesFilter =
        filter === 'all' || workspace.stage === filter

      return matchesSearch && matchesFilter
    },
  )

  const selectedItem = workspaceItems.find(
    ({ workspace }) => workspace.id === selectedWorkspaceId,
  )

  if (selectedItem) {
    return (
      <WorkspaceDetail
        workspace={selectedItem.workspace}
        collaboration={selectedItem.collaboration}
        onBack={() => setSelectedWorkspaceId(null)}
      />
    )
  }

  return (
    <section className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <FolderOpen className="h-5 w-5 text-[var(--color-accent)]" />
          <h2 className="text-xl font-semibold text-[var(--color-heading)]">
            Shared workspaces
          </h2>
        </div>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">
          Keep collaborative articles, investigations, research, and evidence
          organized in dedicated project spaces.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <p className="text-sm text-[var(--color-text-muted)]">
            Total workspaces
          </p>
          <p className="mt-2 text-2xl font-bold text-[var(--color-heading)]">
            {workspaceItems.length}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <p className="text-sm text-[var(--color-text-muted)]">
            In progress
          </p>
          <p className="mt-2 text-2xl font-bold text-[var(--color-heading)]">
            {
              workspaceItems.filter(
                ({ workspace }) => workspace.stage !== 'completed',
              ).length
            }
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <p className="text-sm text-[var(--color-text-muted)]">
            Shared materials
          </p>
          <p className="mt-2 text-2xl font-bold text-[var(--color-heading)]">
            {workspaceItems.reduce(
              (total, item) => total + item.workspace.resources.length,
              0,
            )}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <label className="relative block w-full lg:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search workspaces or materials..."
            className="min-h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] pl-10 pr-4 text-sm text-[var(--color-heading)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)]"
          />
        </label>

        <label className="flex items-center gap-2">
          <span className="text-xs font-medium text-[var(--color-text-muted)]">
            Stage
          </span>
          <select
            value={filter}
            onChange={(event) =>
              setFilter(event.target.value as WorkspaceFilter)
            }
            className="min-h-11 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm text-[var(--color-heading)] outline-none focus:border-[var(--color-accent)]"
          >
            <option value="all">All stages</option>
            <option value="planning">Planning</option>
            <option value="research">Research</option>
            <option value="drafting">Drafting</option>
            <option value="review">Editorial review</option>
            <option value="completed">Completed</option>
          </select>
        </label>
      </div>

      {filteredWorkspaces.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredWorkspaces.map(({ workspace, collaboration }) => (
            <WorkspaceCard
              key={workspace.id}
              workspace={workspace}
              collaboration={collaboration}
              onOpen={() => setSelectedWorkspaceId(workspace.id)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-12 text-center">
          <FolderSearch className="mx-auto h-9 w-9 text-[var(--color-text-muted)]" />
          <h3 className="mt-4 font-semibold text-[var(--color-heading)]">
            No matching workspaces
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--color-text-muted)]">
            Try another search term or change the selected project stage.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch('')
              setFilter('all')
            }}
            className="mt-4 text-sm font-semibold text-[var(--color-accent)] hover:opacity-75"
          >
            Clear filters
          </button>
        </div>
      )}

      <div className="flex items-start gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)]/50 p-4">
        <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-text-muted)]" />
        <p className="text-xs leading-5 text-[var(--color-text-muted)]">
          Workspace materials are illustrative mock data. Opening a workspace
          currently displays its project information and resource list;
          document editing, uploads, and shared discussions will be integrated
          later.
        </p>
      </div>
    </section>
  )
}
