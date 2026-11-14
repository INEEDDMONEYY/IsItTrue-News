
export type CollaborationTab =
  | 'overview'
  | 'discover'
  | 'requests'
  | 'workspaces'
  | 'messages'
  | 'activity'

export type CollaborationStatus =
  | 'active'
  | 'pending'
  | 'invited'
  | 'completed'

export interface CollaborationAuthor {
  id: string
  name: string
  username: string
  avatar?: string
  role: string
  bio: string
  expertise: string[]
  interests: string[]
  isOnline: boolean
}

export interface Collaboration {
  id: string
  title: string
  description: string
  status: CollaborationStatus
  type: 'article' | 'investigation' | 'research'
  collaborators: CollaborationAuthor[]
  updatedAt: string
  unreadMessages: number
}

export interface CollaborationRequest {
  id: string
  author: CollaborationAuthor
  projectTitle: string
  message: string
  direction: 'incoming' | 'outgoing'
  status: 'pending' | 'accepted' | 'declined'
  createdAt: string
}

export interface CollaborationActivity {
  id: string
  author: CollaborationAuthor
  action: string
  target: string
  projectTitle: string
  createdAt: string
  type: 'comment' | 'document' | 'member' | 'status' | 'message'
}

export interface CollaborationStats {
  activeCollaborations: number
  pendingRequests: number
  invitations: number
  unreadMessages: number
}
