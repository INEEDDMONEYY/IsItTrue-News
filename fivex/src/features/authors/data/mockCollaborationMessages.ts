
import type {
  CollaborationConversation,
} from '../types/collaborationMessages.types'

export const CURRENT_AUTHOR_ID = 'author-1'

export const mockCollaborationConversations: CollaborationConversation[] = [
  {
    id: 'conversation-1',
    collaborationId: 'collab-1',
    participantIds: ['author-1', 'author-2', 'author-3'],
    lastMessageAt: '2026-11-12T15:45:00',
    unreadCount: 2,
    messages: [
      {
        id: 'message-1',
        conversationId: 'conversation-1',
        senderId: 'author-2',
        content:
          'I have finished reviewing the latest public spending records. There are a few contract discrepancies worth investigating.',
        createdAt: '2026-11-12T14:20:00',
        status: 'read',
      },
      {
        id: 'message-2',
        conversationId: 'conversation-1',
        senderId: 'author-1',
        content:
          'Great work. Please add the relevant documents to the evidence section so we can review them together.',
        createdAt: '2026-11-12T14:35:00',
        status: 'read',
      },
      {
        id: 'message-3',
        conversationId: 'conversation-1',
        senderId: 'author-3',
        content:
          'I can help verify the source documents and check whether the reported figures match the original records.',
        createdAt: '2026-11-12T15:10:00',
        status: 'read',
      },
      {
        id: 'message-4',
        conversationId: 'conversation-1',
        senderId: 'author-2',
        content:
          'I also found another public report that may help establish the project timeline.',
        createdAt: '2026-11-12T15:35:00',
        status: 'read',
      },
      {
        id: 'message-5',
        conversationId: 'conversation-1',
        senderId: 'author-3',
        content:
          'That could be useful. I will compare it against the contract records before we cite it.',
        createdAt: '2026-11-12T15:45:00',
        status: 'read',
      },
    ],
  },
  {
    id: 'conversation-2',
    collaborationId: 'collab-2',
    participantIds: ['author-1', 'author-2'],
    lastMessageAt: '2026-11-11T16:45:00',
    unreadCount: 0,
    messages: [
      {
        id: 'message-6',
        conversationId: 'conversation-2',
        senderId: 'author-1',
        content:
          'I have organized the healthcare access research into the shared workspace.',
        createdAt: '2026-11-11T15:50:00',
        status: 'read',
      },
      {
        id: 'message-7',
        conversationId: 'conversation-2',
        senderId: 'author-2',
        content:
          'Thanks. I will review the financial data and identify which figures need additional sourcing.',
        createdAt: '2026-11-11T16:45:00',
        status: 'read',
      },
    ],
  },
  {
    id: 'conversation-3',
    collaborationId: 'collab-3',
    participantIds: ['author-1', 'author-3'],
    lastMessageAt: '2026-11-12T12:15:00',
    unreadCount: 1,
    messages: [
      {
        id: 'message-8',
        conversationId: 'conversation-3',
        senderId: 'author-1',
        content:
          'The article draft is ready for another source review. I have highlighted the sections that need verification.',
        createdAt: '2026-11-12T11:40:00',
        status: 'read',
      },
      {
        id: 'message-9',
        conversationId: 'conversation-3',
        senderId: 'author-3',
        content:
          'I found a few sources that could strengthen the privacy section. I will add my verification notes shortly.',
        createdAt: '2026-11-12T12:15:00',
        status: 'read',
      },
    ],
  },
]
