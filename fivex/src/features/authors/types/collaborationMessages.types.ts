
export type CollaborationMessageStatus = 'sent' | 'delivered' | 'read'

export interface CollaborationMessage {
  id: string
  conversationId: string
  senderId: string
  content: string
  createdAt: string
  status: CollaborationMessageStatus
}

export interface CollaborationConversation {
  id: string
  collaborationId: string
  participantIds: string[]
  lastMessageAt: string
  unreadCount: number
  messages: CollaborationMessage[]
}
