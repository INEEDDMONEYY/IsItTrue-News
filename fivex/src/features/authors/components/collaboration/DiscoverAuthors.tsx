
import { useMemo, useState, type FormEvent } from 'react'
import {
  ArrowUpRight,
  Check,
  Filter,
  Search,
  Send,
  UserPlus,
  Users,
  X,
} from 'lucide-react'

import {
  mockCollaborations,
  mockDiscoverAuthors,
} from '../../data/mockCollaborations'

import type { CollaborationAuthor } from '../../types/collaboration.types'

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function AuthorAvatar({ author }: { author: CollaborationAuthor }) {
  return (
    <div className="relative shrink-0">
      {author.avatar ? (
        <img
          src={author.avatar}
          alt={author.name}
          className="h-12 w-12 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-accent)]/10 text-sm font-semibold text-[var(--color-accent)]">
          {getInitials(author.name)}
        </div>
      )}

      <span
        className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[var(--color-surface)] ${
          author.isOnline ? 'bg-emerald-500' : 'bg-gray-400'
        }`}
        title={author.isOnline ? 'Online' : 'Offline'}
      />
    </div>
  )
}

interface InvitationModalProps {
  author: CollaborationAuthor
  onClose: () => void
  onSend: (projectId: string, message: string) => void
}

function InvitationModal({
  author,
  onClose,
  onSend,
}: InvitationModalProps) {
  const [projectId, setProjectId] = useState(
    mockCollaborations[0]?.id ?? '',
  )
  const [message, setMessage] = useState(
    `Hi ${author.name.split(' ')[0]}, I would like to invite you to collaborate on this project. I think your experience would be valuable to the work we're doing.`,
  )

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!projectId || !message.trim()) return

    onSend(projectId, message.trim())
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="invitation-title"
        className="my-auto w-full max-w-lg rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-2xl sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)]">
              Collaboration invitation
            </p>
            <h2
              id="invitation-title"
              className="mt-2 text-xl font-bold text-[var(--color-heading)]"
            >
              Invite {author.name}
            </h2>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Start a conversation about working together.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close invitation"
            className="rounded-lg p-2 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-heading)]"
          >
            <X size={19} />
          </button>
        </div>

        <div className="mt-5 flex items-center gap-3 rounded-xl border border-[var(--color-border)] p-3">
          <AuthorAvatar author={author} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[var(--color-heading)]">
              {author.name}
            </p>
            <p className="truncate text-xs text-[var(--color-text-muted)]">
              {author.role}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="collaboration-project"
              className="mb-2 block text-sm font-medium text-[var(--color-heading)]"
            >
              Invite to project
            </label>

            <select
              id="collaboration-project"
              value={projectId}
              onChange={(event) => setProjectId(event.target.value)}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-3 text-sm text-[var(--color-heading)] outline-none focus:border-[var(--color-accent)]"
              required
            >
              {mockCollaborations.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="collaboration-message"
              className="mb-2 block text-sm font-medium text-[var(--color-heading)]"
            >
              Invitation message
            </label>

            <textarea
              id="collaboration-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={5}
              maxLength={1000}
              required
              className="w-full resize-y rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-3 text-sm leading-6 text-[var(--color-heading)] outline-none placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)]"
              placeholder="Tell this author why you would like to collaborate..."
            />

            <p className="mt-1 text-right text-xs text-[var(--color-text-muted)]">
              {message.length}/1000
            </p>
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[var(--color-border)] px-4 py-2.5 text-sm font-medium text-[var(--color-heading)] transition-colors hover:bg-[var(--color-surface-muted)]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!projectId || !message.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send size={15} />
              Send invitation
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

function AuthorCard({
  author,
  invited,
  onInvite,
}: {
  author: CollaborationAuthor
  invited: boolean
  onInvite: (author: CollaborationAuthor) => void
}) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition-colors hover:border-[var(--color-accent)]/40">
      <div className="flex items-start gap-3">
        <AuthorAvatar author={author} />

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-[var(--color-heading)]">
            {author.name}
          </h3>
          <p className="mt-0.5 truncate text-xs text-[var(--color-text-muted)]">
            @{author.username}
          </p>
          <p className="mt-1 text-xs font-medium text-[var(--color-accent)]">
            {author.role}
          </p>
        </div>
      </div>

      <p className="mt-4 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-[var(--color-text-muted)]">
        {author.bio}
      </p>

      <div className="mt-4">
        <p className="mb-2 text-xs font-semibold text-[var(--color-heading)]">
          Expertise
        </p>
        <div className="flex flex-wrap gap-1.5">
          {author.expertise.slice(0, 3).map((item) => (
            <span
              key={item}
              className="rounded-lg bg-[var(--color-surface-muted)] px-2 py-1 text-xs text-[var(--color-text-muted)]"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-xs font-semibold text-[var(--color-heading)]">
          Interests
        </p>
        <div className="flex flex-wrap gap-1.5">
          {author.interests.slice(0, 2).map((item) => (
            <span
              key={item}
              className="rounded-lg border border-[var(--color-border)] px-2 py-1 text-xs text-[var(--color-text-muted)]"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-[var(--color-border)] pt-4 mt-5">
        <span className="text-xs text-[var(--color-text-muted)]">
          {author.isOnline ? 'Online now' : 'Offline'}
        </span>

        <button
          type="button"
          onClick={() => onInvite(author)}
          disabled={invited}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] px-3 py-2 text-xs font-semibold text-[var(--color-heading)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:cursor-default disabled:opacity-70"
        >
          {invited ? <Check size={14} /> : <UserPlus size={14} />}
          {invited ? 'Invited' : 'Invite'}
        </button>
      </div>
    </article>
  )
}

export function DiscoverAuthors() {
  const [search, setSearch] = useState('')
  const [expertise, setExpertise] = useState('all')
  const [selectedAuthor, setSelectedAuthor] =
    useState<CollaborationAuthor | null>(null)
  const [invitedIds, setInvitedIds] = useState<string[]>([])
  const [successMessage, setSuccessMessage] = useState('')

  const expertiseOptions = useMemo(
    () =>
      Array.from(
        new Set(mockDiscoverAuthors.flatMap((author) => author.expertise)),
      ).sort(),
    [],
  )

  const filteredAuthors = useMemo(() => {
    const query = search.trim().toLowerCase()

    return mockDiscoverAuthors.filter((author) => {
      const searchableContent = [
        author.name,
        author.username,
        author.role,
        author.bio,
        ...author.expertise,
        ...author.interests,
      ]
        .join(' ')
        .toLowerCase()

      const matchesSearch =
        !query || searchableContent.includes(query)

      const matchesExpertise =
        expertise === 'all' || author.expertise.includes(expertise)

      return matchesSearch && matchesExpertise
    })
  }, [search, expertise])

  function handleSendInvitation(projectId: string, message: string) {
    if (!selectedAuthor) return

    const project = mockCollaborations.find(
      (item) => item.id === projectId,
    )

    setInvitedIds((current) =>
      current.includes(selectedAuthor.id)
        ? current
        : [...current, selectedAuthor.id],
    )

    setSuccessMessage(
      `Your invitation to ${selectedAuthor.name} for "${project?.title ?? 'the project'}" has been prepared.`,
    )

    setSelectedAuthor(null)
    void message
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-heading)]">
            Find your next collaborator
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">
            Discover journalists, researchers, and fact-checkers whose
            expertise aligns with your reporting.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
          <Users size={15} />
          {filteredAuthors.length} authors found
        </div>
      </div>

      {successMessage && (
        <div
          role="status"
          className="flex items-start justify-between gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400"
        >
          <div className="flex items-start gap-2">
            <Check size={17} className="mt-0.5 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage('')}
            aria-label="Dismiss invitation confirmation"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_240px]">
        <div className="relative">
          <Search
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search authors, expertise, or topics..."
            aria-label="Search authors"
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-3 pl-11 pr-4 text-sm text-[var(--color-heading)] outline-none placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)]"
          />
        </div>

        <div className="relative">
          <Filter
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
          />
          <select
            value={expertise}
            onChange={(event) => setExpertise(event.target.value)}
            aria-label="Filter by expertise"
            className="w-full appearance-none rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-3 pl-10 pr-3 text-sm text-[var(--color-heading)] outline-none focus:border-[var(--color-accent)]"
          >
            <option value="all">All expertise</option>
            {expertiseOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      {(search || expertise !== 'all') && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-[var(--color-text-muted)]">
            Active filters:
          </span>

          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="inline-flex items-center gap-1 rounded-full bg-[var(--color-surface-muted)] px-3 py-1.5 text-xs text-[var(--color-heading)]"
            >
              Search: {search}
              <X size={12} />
            </button>
          )}

          {expertise !== 'all' && (
            <button
              type="button"
              onClick={() => setExpertise('all')}
              className="inline-flex items-center gap-1 rounded-full bg-[var(--color-surface-muted)] px-3 py-1.5 text-xs text-[var(--color-heading)]"
            >
              {expertise}
              <X size={12} />
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setSearch('')
              setExpertise('all')
            }}
            className="text-xs font-medium text-[var(--color-accent)] hover:underline"
          >
            Clear all
          </button>
        </div>
      )}

      {filteredAuthors.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredAuthors.map((author) => (
            <AuthorCard
              key={author.id}
              author={author}
              invited={invitedIds.includes(author.id)}
              onInvite={setSelectedAuthor}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[var(--color-border)] px-5 py-14 text-center">
          <Search
            size={26}
            className="mx-auto text-[var(--color-text-muted)]"
          />
          <h3 className="mt-4 font-semibold text-[var(--color-heading)]">
            No authors found
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-[var(--color-text-muted)]">
            Try a different name, topic, or expertise filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch('')
              setExpertise('all')
            }}
            className="mt-4 text-sm font-semibold text-[var(--color-accent)] hover:underline"
          >
            Reset filters
          </button>
        </div>
      )}

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
            <ArrowUpRight size={19} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-heading)]">
              Collaboration starts with shared interests
            </h3>
            <p className="mt-1 text-sm leading-6 text-[var(--color-text-muted)]">
              Look beyond job titles. Authors with complementary expertise
              can bring new perspectives, stronger research, and better
              verification to an investigation.
            </p>
          </div>
        </div>
      </div>

      {selectedAuthor && (
        <InvitationModal
          author={selectedAuthor}
          onClose={() => setSelectedAuthor(null)}
          onSend={handleSendInvitation}
        />
      )}
    </section>
  )
}
