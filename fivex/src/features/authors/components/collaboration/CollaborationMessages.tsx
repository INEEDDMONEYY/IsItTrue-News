
import { useMemo, useState, type FormEvent } from 'react'
import {
  ArrowLeft,
  Check,
  CheckCheck,
  Circle,
  MessageCircle,
  MoreHorizontal,
  Paperclip,
  Search,
  Send,
  Users,
} from 'lucide-react'

import { mockCollaborationAuthors } from '@/features/authors/data/mockCollaborations'
import {
  CURRENT_AUTHOR_ID,
  mockCollaborationConversations,
} from '@/features/authors/data/mockCollaborationMessages'
import { mockCollaborations } from '@/features/authors/data/mockCollaborations'
import type {
  CollaborationConversation,
  CollaborationMessage,
} from '@/features/authors/types/collaborationMessages.types'

function getAuthor(authorId: string) {
  return mockCollaborationAuthors.find((author) => author.id === authorId)
}

function getProjectTitle(collaborationId: string) {
  return (
    mockCollaborations.find((item) => item.id === collaborationId)?.title ??
    'Collaboration project'
  )
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function formatMessageTime(date: string) {
  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) return date

  return new Intl.DateTimeFormat('en', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(parsedDate)
}

function formatConversationDate(date: string) {
  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) return date

  const today = new Date()
  const isToday =
    parsedDate.getDate() === today.getDate() &&
    parsedDate.getMonth() === today.getMonth() &&
    parsedDate.getFullYear() === today.getFullYear()

  if (isToday) return formatMessageTime(date)

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
  }).format(parsedDate)
}

function AuthorAvatar({
  authorId,
  size = 'md',
}: {
  authorId: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const author = getAuthor(authorId)

  if (!author) return null

  const sizeClasses = {
    sm: 'h-9 w-9 text-xs',
    md: 'h-11 w-11 text-sm',
    lg: 'h-12 w-12 text-sm',
  }

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-muted)] font-semibold text-[var(--color-heading)] ${sizeClasses[size]}`}
      title={author.name}
    >
      {author.avatar ? (
        <img
          src={author.avatar}
          alt={author.name}
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        getInitials(author.name)
      )}

      {author.isOnline && (
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[var(--color-surface)] bg-emerald-500" />
      )}
    </div>
  )
}

function getConversationName(conversation: CollaborationConversation) {
  const otherAuthors = conversation.participantIds
    .filter((id) => id !== CURRENT_AUTHOR_ID)
    .map(getAuthor)
    .filter((author) => author !== undefined)

  if (otherAuthors.length === 1) return otherAuthors[0].name

  return otherAuthors.map((author) => author.name.split(' ')[0]).join(', ')
}

function getConversationPreview(conversation: CollaborationConversation) {
  const lastMessage = conversation.messages.at(-1)

  if (!lastMessage) return 'No messages yet'

  const author = getAuthor(lastMessage.senderId)
  const prefix =
    lastMessage.senderId === CURRENT_AUTHOR_ID ? 'You: ' : `${author?.name.split(' ')[0] ?? 'Author'}: `

  return `${prefix}${lastMessage.content}`
}

function ConversationListItem({
  conversation,
  selected,
  onClick,
}: {
  conversation: CollaborationConversation
  selected: boolean
  onClick: () => void
}) {
  const otherAuthorIds = conversation.participantIds.filter(
    (id) => id !== CURRENT_AUTHOR_ID,
  )
  const lastMessage = conversation.messages.at(-1)

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl p-3 text-left transition ${
        selected
          ? 'bg-[var(--color-surface-muted)] ring-1 ring-[var(--color-accent)]/30'
          : 'hover:bg-[var(--color-surface-muted)]'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex -space-x-3 pt-0.5">
          {otherAuthorIds.slice(0, 2).map((authorId) => (
            <div
              key={authorId}
              className="rounded-full border-2 border-[var(--color-surface)]"
            >
              <AuthorAvatar authorId={authorId} size="md" />
            </div>
          ))}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate text-sm font-semibold text-[var(--color-heading)]">
              {getConversationName(conversation)}
            </p>

            <span className="shrink-0 text-[10px] text-[var(--color-text-muted)]">
              {lastMessage
                ? formatConversationDate(lastMessage.createdAt)
                : ''}
            </span>
          </div>

          <p className="mt-1 truncate text-xs text-[var(--color-accent)]">
            {getProjectTitle(conversation.collaborationId)}
          </p>

          <div className="mt-1.5 flex items-center justify-between gap-2">
            <p className="truncate text-xs text-[var(--color-text-muted)]">
              {getConversationPreview(conversation)}
            </p>

            {conversation.unreadCount > 0 && (
              <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] px-1.5 text-[10px] font-semibold text-white">
                {conversation.unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}

function MessageBubble({
  message,
}: {
  message: CollaborationMessage
}) {
  const isCurrentAuthor = message.senderId === CURRENT_AUTHOR_ID
  const author = getAuthor(message.senderId)

  return (
    <div
      className={`flex items-end gap-2 ${
        isCurrentAuthor ? 'justify-end' : 'justify-start'
      }`}
    >
      {!isCurrentAuthor && (
        <AuthorAvatar authorId={message.senderId} size="sm" />
      )}

      <div
        className={`max-w-[85%] sm:max-w-[75%] ${
          isCurrentAuthor ? 'items-end' : 'items-start'
        } flex flex-col`}
      >
        {!isCurrentAuthor && (
          <span className="mb-1 px-1 text-[11px] font-medium text-[var(--color-text-muted)]">
            {author?.name ?? 'Collaborator'}
          </span>
        )}

        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
            isCurrentAuthor
              ? 'rounded-br-md bg-[var(--color-accent)] text-white'
              : 'rounded-bl-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-heading)]'
          }`}
        >
          {message.content}
        </div>

        <div className="mt-1 flex items-center gap-1 px-1 text-[10px] text-[var(--color-text-muted)]">
          <span>{formatMessageTime(message.createdAt)}</span>

          {isCurrentAuthor && (
            message.status === 'read' ? (
              <CheckCheck className="h-3.5 w-3.5" />
            ) : message.status === 'delivered' ? (
              <CheckCheck className="h-3.5 w-3.5" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )
          )}
        </div>
      </div>

      {isCurrentAuthor && (
        <AuthorAvatar authorId={CURRENT_AUTHOR_ID} size="sm" />
      )}
    </div>
  )
}

function ConversationDetail({
  conversation,
  onBack,
  onSend,
}: {
  conversation: CollaborationConversation
  onBack: () => void
  onSend: (content: string) => void
}) {
  const [message, setMessage] = useState('')

  const otherAuthorIds = conversation.participantIds.filter(
    (id) => id !== CURRENT_AUTHOR_ID,
  )

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const content = message.trim()
    if (!content) return

    onSend(content)
    setMessage('')
  }

  return (
    <div className="flex min-h-[540px] flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] lg:min-h-[680px]">
      <header className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] p-4">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="rounded-lg p-2 text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-muted)] lg:hidden"
            aria-label="Back to conversations"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="flex -space-x-3">
            {otherAuthorIds.slice(0, 3).map((authorId) => (
              <div
                key={authorId}
                className="rounded-full border-2 border-[var(--color-surface)]"
              >
                <AuthorAvatar authorId={authorId} size="md" />
              </div>
            ))}
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-[var(--color-heading)]">
              {getConversationName(conversation)}
            </h3>
            <p className="truncate text-xs text-[var(--color-text-muted)]">
              {getProjectTitle(conversation.collaborationId)}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-muted)]"
          aria-label="Conversation options"
          title="Conversation options"
        >
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </header>

      <div className="flex items-center gap-2 border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]/40 px-4 py-2.5">
        <Users className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
        <p className="text-xs text-[var(--color-text-muted)]">
          {conversation.participantIds.length} project participants
        </p>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-5">
        <div className="py-2 text-center">
          <span className="rounded-full bg-[var(--color-surface-muted)] px-3 py-1 text-[10px] text-[var(--color-text-muted)]">
            Project conversation
          </span>
        </div>

        {conversation.messages.map((item) => (
          <MessageBubble key={item.id} message={item} />
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-[var(--color-border)] p-3 sm:p-4"
      >
        <div className="flex items-end gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)]/50 p-2">
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                event.currentTarget.form?.requestSubmit()
              }
            }}
            rows={1}
            placeholder="Write a message to your collaborators..."
            aria-label="Write a message"
            className="max-h-32 min-h-10 flex-1 resize-y bg-transparent px-2 py-2 text-sm text-[var(--color-heading)] outline-none placeholder:text-[var(--color-text-muted)]"
          />

          <button
            type="submit"
            disabled={!message.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent)] text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-2 px-1 text-[10px] text-[var(--color-text-muted)]">
          Press Enter to send · Shift + Enter for a new line
        </p>
      </form>
    </div>
  )
}

export function CollaborationMessages() {
  const [conversations, setConversations] = useState<
    CollaborationConversation[]
  >(mockCollaborationConversations)

  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null)

  const [search, setSearch] = useState('')

  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase()

    return conversations
      .filter((conversation) => {
        if (!query) return true

        const projectTitle = getProjectTitle(
          conversation.collaborationId,
        )

        const participantNames = conversation.participantIds
          .map(getAuthor)
          .filter(Boolean)
          .map((author) => author.name)
          .join(' ')

        return (
          projectTitle.toLowerCase().includes(query) ||
          participantNames.toLowerCase().includes(query)
        )
      })
      .sort(
        (a, b) =>
          new Date(b.lastMessageAt).getTime() -
          new Date(a.lastMessageAt).getTime(),
      )
  }, [conversations, search])

  const selectedConversation = conversations.find(
    (conversation) => conversation.id === selectedConversationId,
  )

  const unreadCount = conversations.reduce(
    (total, conversation) => total + conversation.unreadCount,
    0,
  )

  function handleSelectConversation(conversationId: string) {
    setSelectedConversationId(conversationId)

    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === conversationId
          ? { ...conversation, unreadCount: 0 }
          : conversation,
      ),
    )
  }

  function handleSendMessage(content: string) {
    if (!selectedConversationId) return

    const now = new Date().toISOString()

    const newMessage: CollaborationMessage = {
      id: `message-${Date.now()}`,
      conversationId: selectedConversationId,
      senderId: CURRENT_AUTHOR_ID,
      content,
      createdAt: now,
      status: 'sent',
    }

    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === selectedConversationId
          ? {
              ...conversation,
              lastMessageAt: now,
              messages: [...conversation.messages, newMessage],
            }
          : conversation,
      ),
    )
  }

  return (
    <section className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-[var(--color-accent)]" />
          <h2 className="text-xl font-semibold text-[var(--color-heading)]">
            Collaboration messages
          </h2>
        </div>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">
          Communicate with co-authors, coordinate research, and keep project
          discussions connected to their collaborative work.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <p className="text-sm text-[var(--color-text-muted)]">
            Conversations
          </p>
          <p className="mt-2 text-2xl font-bold text-[var(--color-heading)]">
            {conversations.length}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <p className="text-sm text-[var(--color-text-muted)]">
            Unread messages
          </p>
          <p className="mt-2 text-2xl font-bold text-[var(--color-heading)]">
            {unreadCount}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <p className="text-sm text-[var(--color-text-muted)]">
            Collaborators
          </p>
          <p className="mt-2 text-2xl font-bold text-[var(--color-heading)]">
            {
              new Set(
                conversations.flatMap((conversation) =>
                  conversation.participantIds.filter(
                    (id) => id !== CURRENT_AUTHOR_ID,
                  ),
                ),
              ).size
            }
          </p>
        </div>
      </div>

      <div className="grid min-h-[540px] overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside
          className={`border-b border-[var(--color-border)] p-3 lg:border-b-0 lg:border-r ${
            selectedConversationId ? 'hidden lg:block' : 'block'
          }`}
        >
          <div className="mb-4 px-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold text-[var(--color-heading)]">
                Conversations
              </h3>
              <span className="text-xs text-[var(--color-text-muted)]">
                {filteredConversations.length} projects
              </span>
            </div>

            <label className="relative mt-3 block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search conversations..."
                className="h-10 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] pl-9 pr-3 text-xs text-[var(--color-heading)] outline-none focus:border-[var(--color-accent)]"
              />
            </label>
          </div>

          <div className="space-y-1">
            {filteredConversations.map((conversation) => (
              <ConversationListItem
                key={conversation.id}
                conversation={conversation}
                selected={selectedConversationId === conversation.id}
                onClick={() =>
                  handleSelectConversation(conversation.id)
                }
              />
            ))}
          </div>

          {filteredConversations.length === 0 && (
            <div className="px-4 py-10 text-center">
              <Search className="mx-auto h-6 w-6 text-[var(--color-text-muted)]" />
              <p className="mt-3 text-sm font-medium text-[var(--color-heading)]">
                No conversations found
              </p>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                Try another author or project name.
              </p>
            </div>
          )}
        </aside>

        <div
          className={`min-w-0 ${
            selectedConversationId ? 'block' : 'hidden lg:block'
          }`}
        >
          {selectedConversation ? (
            <ConversationDetail
              conversation={selectedConversation}
              onBack={() => setSelectedConversationId(null)}
              onSend={handleSendMessage}
            />
          ) : (
            <div className="flex min-h-[540px] flex-col items-center justify-center px-6 py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]">
                <MessageCircle className="h-6 w-6" />
              </div>

              <h3 className="mt-4 font-semibold text-[var(--color-heading)]">
                Select a conversation
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--color-text-muted)]">
                Choose a project conversation to view messages and communicate
                with your collaborators.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)]/50 p-4">
        <p className="text-xs leading-5 text-[var(--color-text-muted)]">
          Messages currently operate in local demo state. Real-time delivery,
          message persistence, attachments, notifications, and conversation
          permissions will be connected through your backend.
        </p>
      </div>
    </section>
  )
}
