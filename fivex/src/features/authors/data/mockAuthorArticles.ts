
import type { AuthorArticle } from '@/features/authors/types/authorArticle.types'

export const mockAuthorArticles: AuthorArticle[] = [
  {
    id: 'article-001',
    title: 'The Hidden Cost of America’s Water Infrastructure',
    slug: 'hidden-cost-americas-water-infrastructure',
    excerpt:
      'An investigation into aging water systems, deferred maintenance, and the communities paying the price.',
    status: 'draft',
    category: 'Investigations',
    tags: ['Infrastructure', 'Water', 'Public Policy'],
    authorId: 'author-001',
    authorName: 'Alex Morgan',
    createdAt: '2026-08-08T09:15:00Z',
    updatedAt: '2026-08-10T11:30:00Z',

    workflow: {
      stage: 'collaboration',
      completionPercent: 68,
      lastAction: 'Co-author requested revisions',
      nextAction: 'Review collaborative edits',
    },

    collaboration: {
      enabled: true,
      coAuthors: [
        {
          id: 'author-002',
          name: 'Jordan Lee',
          role: 'Researcher',
          avatar: null,
        },
      ],
      assignments: [
        {
          id: 'assignment-001',
          assignedTo: 'Jordan Lee',
          task: 'Verify infrastructure spending data',
          status: 'in-progress',
          dueDate: '2026-08-12T17:00:00Z',
        },
        {
          id: 'assignment-002',
          assignedTo: 'Alex Morgan',
          task: 'Complete interview section',
          status: 'completed',
          dueDate: '2026-08-10T17:00:00Z',
        },
      ],
    },

    revisions: {
      requested: false,
      count: 2,
      latestRequest: null,
    },

    factCheck: {
      status: 'not-submitted',
      requestId: null,
      issuesFound: 0,
      verifiedClaims: 0,
    },

    submission: {
      ready: false,
      submittedAt: null,
      editorId: null,
    },

    metrics: {
      wordCount: 2840,
      sources: 17,
      evidenceItems: 8,
      mediaItems: 4,
    },
  },

  {
    id: 'article-002',
    title: 'Inside the Race to Protect America’s Public Records',
    slug: 'race-to-protect-public-records',
    excerpt:
      'Local archivists and digital preservation experts are fighting to keep critical public records accessible.',
    status: 'draft',
    category: 'Public Records',
    tags: ['Archives', 'Transparency', 'Government'],
    authorId: 'author-001',
    authorName: 'Alex Morgan',
    createdAt: '2026-08-05T14:20:00Z',
    updatedAt: '2026-08-09T16:45:00Z',

    workflow: {
      stage: 'assignment',
      completionPercent: 42,
      lastAction: 'Editor assigned research tasks',
      nextAction: 'Complete assigned research',
    },

    collaboration: {
      enabled: true,
      coAuthors: [],
      assignments: [
        {
          id: 'assignment-003',
          assignedTo: 'Alex Morgan',
          task: 'Interview three records officers',
          status: 'in-progress',
          dueDate: '2026-08-15T17:00:00Z',
        },
        {
          id: 'assignment-004',
          assignedTo: 'Taylor Brooks',
          task: 'Research state retention policies',
          status: 'pending',
          dueDate: '2026-08-14T17:00:00Z',
        },
      ],
    },

    revisions: {
      requested: false,
      count: 0,
      latestRequest: null,
    },

    factCheck: {
      status: 'not-submitted',
      requestId: null,
      issuesFound: 0,
      verifiedClaims: 0,
    },

    submission: {
      ready: false,
      submittedAt: null,
      editorId: null,
    },

    metrics: {
      wordCount: 1680,
      sources: 9,
      evidenceItems: 4,
      mediaItems: 2,
    },
  },

  {
    id: 'article-003',
    title: 'What Happens When a City Loses Its Local Newspaper?',
    slug: 'what-happens-when-city-loses-local-newspaper',
    excerpt:
      'A look at how news deserts affect accountability, civic participation, and public trust.',
    status: 'draft',
    category: 'Media',
    tags: ['News Deserts', 'Local Journalism', 'Accountability'],
    authorId: 'author-001',
    authorName: 'Alex Morgan',
    createdAt: '2026-07-29T10:00:00Z',
    updatedAt: '2026-08-07T13:10:00Z',

    workflow: {
      stage: 'revision',
      completionPercent: 81,
      lastAction: 'Editor requested revisions',
      nextAction: 'Address editor feedback',
    },

    collaboration: {
      enabled: true,
      coAuthors: [
        {
          id: 'author-003',
          name: 'Sam Rivera',
          role: 'Reporter',
          avatar: null,
        },
      ],
      assignments: [
        {
          id: 'assignment-005',
          assignedTo: 'Alex Morgan',
          task: 'Expand local resident interviews',
          status: 'in-progress',
          dueDate: '2026-08-11T17:00:00Z',
        },
      ],
    },

    revisions: {
      requested: true,
      count: 3,
      latestRequest: {
        id: 'revision-003',
        requestedBy: 'Editor Team',
        requestedAt: '2026-08-07T13:10:00Z',
        summary:
          'Add additional local voices and clarify the methodology used to evaluate newsroom closures.',
        status: 'open',
      },
    },

    factCheck: {
      status: 'not-submitted',
      requestId: null,
      issuesFound: 0,
      verifiedClaims: 0,
    },

    submission: {
      ready: false,
      submittedAt: null,
      editorId: null,
    },

    metrics: {
      wordCount: 3210,
      sources: 21,
      evidenceItems: 11,
      mediaItems: 6,
    },
  },

  {
    id: 'article-004',
    title: 'How Public Agencies Track Community Complaints',
    slug: 'how-public-agencies-track-community-complaints',
    excerpt:
      'Records reveal how agencies categorize, prioritize, and respond to complaints from the public.',
    status: 'draft',
    category: 'Accountability',
    tags: ['Public Records', 'Accountability', 'Government'],
    authorId: 'author-001',
    authorName: 'Alex Morgan',
    createdAt: '2026-07-20T08:30:00Z',
    updatedAt: '2026-08-06T18:20:00Z',

    workflow: {
      stage: 'fact-check',
      completionPercent: 92,
      lastAction: 'Fact-check request submitted',
      nextAction: 'Resolve remaining verification issues',
    },

    collaboration: {
      enabled: false,
      coAuthors: [],
      assignments: [],
    },

    revisions: {
      requested: false,
      count: 1,
      latestRequest: null,
    },

    factCheck: {
      status: 'in-review',
      requestId: 'factcheck-004',
      issuesFound: 2,
      verifiedClaims: 18,
    },

    submission: {
      ready: false,
      submittedAt: null,
      editorId: null,
    },

    metrics: {
      wordCount: 3980,
      sources: 26,
      evidenceItems: 15,
      mediaItems: 3,
    },
  },

  {
    id: 'article-005',
    title: 'The Investigation Into Missing Municipal Funds',
    slug: 'investigation-missing-municipal-funds',
    excerpt:
      'An evidence-based investigation following a trail of public spending across multiple agencies.',
    status: 'submitted',
    category: 'Investigations',
    tags: ['Investigations', 'Public Funds', 'Accountability'],
    authorId: 'author-001',
    authorName: 'Alex Morgan',
    createdAt: '2026-07-10T12:00:00Z',
    updatedAt: '2026-08-04T15:45:00Z',

    workflow: {
      stage: 'editor-review',
      completionPercent: 100,
      lastAction: 'Submitted to editorial review',
      nextAction: 'Await editor decision',
    },

    collaboration: {
      enabled: true,
      coAuthors: [
        {
          id: 'author-004',
          name: 'Morgan Davis',
          role: 'Investigative Reporter',
          avatar: null,
        },
      ],
      assignments: [
        {
          id: 'assignment-006',
          assignedTo: 'Morgan Davis',
          task: 'Verify financial records',
          status: 'completed',
          dueDate: '2026-07-30T17:00:00Z',
        },
      ],
    },

    revisions: {
      requested: false,
      count: 2,
      latestRequest: null,
    },

    factCheck: {
      status: 'verified',
      requestId: 'factcheck-005',
      issuesFound: 0,
      verifiedClaims: 34,
    },

    submission: {
      ready: true,
      submittedAt: '2026-08-04T15:45:00Z',
      editorId: 'editor-001',
    },

    metrics: {
      wordCount: 5420,
      sources: 38,
      evidenceItems: 24,
      mediaItems: 9,
    },
  },
]

