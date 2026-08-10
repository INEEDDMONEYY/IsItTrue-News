
import { useMemo, useState } from 'react'

export type SubmissionQueueStatus =
  | 'submitted'
  | 'under_review'
  | 'revision_requested'
  | 'approved'
  | 'published'
  | 'rejected'

export interface SubmissionQueueItem {
  id: string
  title: string
  slug?: string
  excerpt?: string
  status: SubmissionQueueStatus
  submittedAt: string
  updatedAt: string
  assignedEditor?: {
    id: string
    name: string
    avatar?: string
  }
  collaborators?: Array<{
    id: string
    name: string
    role: 'co_author' | 'editor' | 'researcher'
    avatar?: string
  }>
  category?: string
  wordCount?: number
  revisionCount?: number
  feedbackCount?: number
  priority?: 'low' | 'normal' | 'high'
}

const mockSubmissionQueue: SubmissionQueueItem[] = [
  {
    id: 'submission-001',
    title: 'The Hidden Cost of America’s Infrastructure Crisis',
    slug: 'hidden-cost-americas-infrastructure-crisis',
    excerpt:
      'An investigation into aging infrastructure, public spending, and the communities carrying the cost.',
    status: 'under_review',
    submittedAt: '2026-08-06T14:30:00Z',
    updatedAt: '2026-08-08T10:15:00Z',
    assignedEditor: {
      id: 'editor-001',
      name: 'Jordan Mitchell',
    },
    collaborators: [
      {
        id: 'author-002',
        name: 'Marcus Reed',
        role: 'co_author',
      },
    ],
    category: 'Investigations',
    wordCount: 2840,
    revisionCount: 1,
    feedbackCount: 3,
    priority: 'high',
  },
  {
    id: 'submission-002',
    title: 'What the Latest Housing Data Really Tells Us',
    slug: 'latest-housing-data',
    excerpt:
      'A closer examination of housing affordability data and what the national numbers leave out.',
    status: 'revision_requested',
    submittedAt: '2026-08-03T09:20:00Z',
    updatedAt: '2026-08-07T16:45:00Z',
    assignedEditor: {
      id: 'editor-002',
      name: 'Sarah Williams',
    },
    collaborators: [],
    category: 'Economy',
    wordCount: 1960,
    revisionCount: 2,
    feedbackCount: 5,
    priority: 'normal',
  },
  {
    id: 'submission-003',
    title: 'Inside the Fight Over Local Water Rights',
    slug: 'fight-over-local-water-rights',
    excerpt:
      'Documents and interviews reveal the competing interests shaping a critical regional water dispute.',
    status: 'approved',
    submittedAt: '2026-07-28T11:00:00Z',
    updatedAt: '2026-08-05T13:10:00Z',
    assignedEditor: {
      id: 'editor-001',
      name: 'Jordan Mitchell',
    },
    collaborators: [
      {
        id: 'author-003',
        name: 'Taylor Brooks',
        role: 'researcher',
      },
    ],
    category: 'Local',
    wordCount: 3210,
    revisionCount: 1,
    feedbackCount: 2,
    priority: 'normal',
  },
  {
    id: 'submission-004',
    title: 'The Algorithm Behind Your News Feed',
    slug: 'algorithm-behind-news-feed',
    excerpt:
      'How recommendation systems influence what readers see, share, and believe.',
    status: 'submitted',
    submittedAt: '2026-08-09T08:45:00Z',
    updatedAt: '2026-08-09T08:45:00Z',
    collaborators: [],
    category: 'Technology',
    wordCount: 2240,
    revisionCount: 0,
    feedbackCount: 0,
    priority: 'normal',
  },
  {
    id: 'submission-005',
    title: 'When Public Records Disappear',
    slug: 'when-public-records-disappear',
    excerpt:
      'Tracking changes to public records and the consequences for journalists and the public.',
    status: 'published',
    submittedAt: '2026-07-12T15:30:00Z',
    updatedAt: '2026-07-25T12:00:00Z',
    assignedEditor: {
      id: 'editor-003',
      name: 'Alex Morgan',
    },
    collaborators: [],
    category: 'Accountability',
    wordCount: 2780,
    revisionCount: 2,
    feedbackCount: 7,
    priority: 'normal',
  },
]

export function useSubmissionQueue() {
  const [submissions, setSubmissions] =
    useState<SubmissionQueueItem[]>(mockSubmissionQueue)

  const [statusFilter, setStatusFilter] = useState<
    SubmissionQueueStatus | 'all'
  >('all')

  const [search, setSearch] = useState('')

  const [sortBy, setSortBy] = useState<
    'updated' | 'submitted' | 'title'
  >('updated')

  const filteredSubmissions = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    const filtered = submissions.filter((submission) => {
      const matchesStatus =
        statusFilter === 'all' ||
        submission.status === statusFilter

      const matchesSearch =
        !normalizedSearch ||
        submission.title.toLowerCase().includes(normalizedSearch) ||
        submission.excerpt?.toLowerCase().includes(normalizedSearch) ||
        submission.category?.toLowerCase().includes(normalizedSearch) ||
        submission.assignedEditor?.name
          .toLowerCase()
          .includes(normalizedSearch)

      return matchesStatus && matchesSearch
    })

    return [...filtered].sort((a, b) => {
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title)
      }

      if (sortBy === 'submitted') {
        return (
          new Date(b.submittedAt).getTime() -
          new Date(a.submittedAt).getTime()
        )
      }

      return (
        new Date(b.updatedAt).getTime() -
        new Date(a.updatedAt).getTime()
      )
    })
  }, [submissions, statusFilter, search, sortBy])

  const stats = useMemo(() => {
    return {
      total: submissions.length,

      submitted: submissions.filter(
        (submission) => submission.status === 'submitted',
      ).length,

      underReview: submissions.filter(
        (submission) => submission.status === 'under_review',
      ).length,

      revisionsRequested: submissions.filter(
        (submission) =>
          submission.status === 'revision_requested',
      ).length,

      approved: submissions.filter(
        (submission) => submission.status === 'approved',
      ).length,

      published: submissions.filter(
        (submission) => submission.status === 'published',
      ).length,

      rejected: submissions.filter(
        (submission) => submission.status === 'rejected',
      ).length,
    }
  }, [submissions])

  const updateSubmissionStatus = (
    id: string,
    status: SubmissionQueueStatus,
  ) => {
    setSubmissions((current) =>
      current.map((submission) =>
        submission.id === id
          ? {
              ...submission,
              status,
              updatedAt: new Date().toISOString(),
            }
          : submission,
      ),
    )
  }

  const clearFilters = () => {
    setStatusFilter('all')
    setSearch('')
    setSortBy('updated')
  }

  return {
    submissions: filteredSubmissions,
    allSubmissions: submissions,

    stats,

    statusFilter,
    setStatusFilter,

    search,
    setSearch,

    sortBy,
    setSortBy,

    updateSubmissionStatus,
    clearFilters,
  }
}

