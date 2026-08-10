
import { mockAuthorArticles } from './mockAuthorArticles'
import type { ArticleSubmission } from '@/features/authors/types/submission.types'

const articleById = new Map(
  mockAuthorArticles.map((article) => [article.id, article]),
)

export const mockSubmissions: ArticleSubmission[] = [
  {
    id: 'submission-001',
    articleId: 'article-005',
    article: articleById.get('article-005')!,

    status: 'editor-review',

    submittedAt: '2026-08-04T15:45:00Z',
    reviewedAt: null,
    publishedAt: null,

    assignedEditor: {
      id: 'editor-001',
      name: 'Editorial Team',
      avatar: null,
    },

    editorialNote:
      'Your investigation has been received and is currently undergoing editorial review.',

    timeline: [
      {
        id: 'timeline-001',
        label: 'Article submitted',
        description: 'Submitted for editorial review.',
        timestamp: '2026-08-04T15:45:00Z',
        completed: true,
      },
      {
        id: 'timeline-002',
        label: 'Fact check verified',
        description: 'All submitted claims passed verification.',
        timestamp: '2026-08-04T14:20:00Z',
        completed: true,
      },
      {
        id: 'timeline-003',
        label: 'Editorial review',
        description: 'An editor is reviewing the article.',
        timestamp: '2026-08-05T09:00:00Z',
        completed: true,
      },
      {
        id: 'timeline-004',
        label: 'Editorial decision',
        description: 'Awaiting the editor’s decision.',
        timestamp: '',
        completed: false,
      },
    ],
  },

  {
    id: 'submission-002',
    articleId: 'article-003',
    article: articleById.get('article-003')!,

    status: 'revision-requested',

    submittedAt: '2026-07-30T12:00:00Z',
    reviewedAt: '2026-08-07T13:10:00Z',
    publishedAt: null,

    assignedEditor: {
      id: 'editor-002',
      name: 'Jordan Mitchell',
      avatar: null,
    },

    editorialNote:
      'Please address the requested revisions before resubmitting the article.',

    timeline: [
      {
        id: 'timeline-005',
        label: 'Article submitted',
        description: 'Submitted for editorial review.',
        timestamp: '2026-07-30T12:00:00Z',
        completed: true,
      },
      {
        id: 'timeline-006',
        label: 'Editorial review',
        description: 'The editor reviewed the submission.',
        timestamp: '2026-08-07T13:10:00Z',
        completed: true,
      },
      {
        id: 'timeline-007',
        label: 'Revisions requested',
        description:
          'The editor requested additional reporting and clarification.',
        timestamp: '2026-08-07T13:10:00Z',
        completed: true,
      },
      {
        id: 'timeline-008',
        label: 'Resubmission',
        description: 'Address the requested changes and resubmit.',
        timestamp: '',
        completed: false,
      },
    ],
  },

  {
    id: 'submission-003',
    articleId: 'article-004',
    article: articleById.get('article-004')!,

    status: 'ready',

    submittedAt: null,
    reviewedAt: null,
    publishedAt: null,

    assignedEditor: null,

    editorialNote: null,

    timeline: [
      {
        id: 'timeline-009',
        label: 'Draft completed',
        description: 'The article is ready for final submission.',
        timestamp: '2026-08-06T18:20:00Z',
        completed: true,
      },
      {
        id: 'timeline-010',
        label: 'Fact check',
        description: 'Fact-check review is complete.',
        timestamp: '2026-08-06T16:45:00Z',
        completed: true,
      },
      {
        id: 'timeline-011',
        label: 'Ready for submission',
        description: 'Submit the article to the editorial team.',
        timestamp: '',
        completed: false,
      },
    ],
  },
]

