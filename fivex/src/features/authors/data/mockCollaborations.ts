
import type {
  Collaboration,
  CollaborationActivity,
  CollaborationAuthor,
  CollaborationRequest,
  CollaborationStats,
} from '../types/collaboration.types'

// --------------------------------------------------
// Authors
// --------------------------------------------------

export const mockCollaborationAuthors: CollaborationAuthor[] = [
  {
    id: 'author-1',
    name: 'Jordan Mitchell',
    username: 'jordanmitchell',
    role: 'Investigative Journalist',
    bio: 'Investigative journalist covering public accountability, government transparency, and institutional oversight.',
    expertise: ['Investigative Journalism', 'Public Records', 'Politics'],
    interests: ['Government Accountability', 'Public Policy'],
    isOnline: true,
  },
  {
    id: 'author-2',
    name: 'Taylor Brooks',
    username: 'taylorbrooks',
    role: 'Research Journalist',
    bio: 'Research-focused journalist specializing in data analysis, corporate accountability, and financial reporting.',
    expertise: ['Data Journalism', 'Finance', 'Research'],
    interests: ['Corporate Accountability', 'Economics'],
    isOnline: false,
  },
  {
    id: 'author-3',
    name: 'Morgan Ellis',
    username: 'morganellis',
    role: 'Fact-Checker',
    bio: 'Fact-checking professional focused on source verification, misinformation, and evidence-based reporting.',
    expertise: ['Fact-Checking', 'Source Verification', 'Media Literacy'],
    interests: ['Misinformation', 'Digital Media'],
    isOnline: true,
  },
  {
    id: 'author-4',
    name: 'Alexandra Reed',
    username: 'alexreed',
    role: 'Environmental Journalist',
    bio: 'Reports on environmental policy, climate accountability, and the impact of industrial development on local communities.',
    expertise: ['Environmental Journalism', 'Climate Policy', 'Research'],
    interests: ['Climate Change', 'Public Policy'],
    isOnline: true,
  },
  {
    id: 'author-5',
    name: 'Christopher Hayes',
    username: 'chrishayes',
    role: 'Technology Journalist',
    bio: 'Covers technology, cybersecurity, digital privacy, and the influence of emerging technologies on society.',
    expertise: ['Technology', 'Cybersecurity', 'Digital Privacy'],
    interests: ['Consumer Rights', 'Technology Policy'],
    isOnline: false,
  },
  {
    id: 'author-6',
    name: 'Samantha Cole',
    username: 'samanthacole',
    role: 'Public Health Researcher',
    bio: 'Investigates public health systems, healthcare access, medical policy, and evidence-based health reporting.',
    expertise: ['Public Health', 'Healthcare Research', 'Data Journalism'],
    interests: ['Healthcare Access', 'Medical Policy'],
    isOnline: true,
  },
  {
    id: 'author-7',
    name: 'Daniel Foster',
    username: 'danielfoster',
    role: 'Financial Journalist',
    bio: 'Focuses on financial investigations, consumer protection, corporate reporting, and economic accountability.',
    expertise: ['Financial Journalism', 'Corporate Research', 'Data Analysis'],
    interests: ['Consumer Protection', 'Economics'],
    isOnline: false,
  },
  {
    id: 'author-8',
    name: 'Olivia Bennett',
    username: 'oliviabennett',
    role: 'Media Researcher',
    bio: 'Studies media credibility, misinformation, source transparency, and the evolving role of independent journalism.',
    expertise: ['Media Research', 'Fact-Checking', 'Media Literacy'],
    interests: ['Misinformation', 'Journalism Standards'],
    isOnline: true,
  },
]

// --------------------------------------------------
// Author discovery
// --------------------------------------------------

export const mockDiscoverAuthors: CollaborationAuthor[] = [
  ...mockCollaborationAuthors,
]

// --------------------------------------------------
// Active collaborations
// --------------------------------------------------

export const mockCollaborations: Collaboration[] = [
  {
    id: 'collab-1',
    title: 'Public Infrastructure Accountability',
    description:
      'A collaborative investigation into public infrastructure spending, project delays, and government oversight.',
    status: 'active',
    type: 'investigation',
    collaborators: [
      mockCollaborationAuthors[0],
      mockCollaborationAuthors[1],
      mockCollaborationAuthors[2],
    ],
    updatedAt: '2026-11-12T15:30:00',
    unreadMessages: 3,
  },
  {
    id: 'collab-2',
    title: 'The Cost of Healthcare Access',
    description:
      'Researching healthcare affordability and access disparities through public data and verified sources.',
    status: 'active',
    type: 'research',
    collaborators: [
      mockCollaborationAuthors[0],
      mockCollaborationAuthors[1],
    ],
    updatedAt: '2026-11-11T12:00:00',
    unreadMessages: 0,
  },
  {
    id: 'collab-3',
    title: 'Digital Privacy and Consumer Rights',
    description:
      'A shared article examining consumer privacy protections and emerging digital rights concerns.',
    status: 'active',
    type: 'article',
    collaborators: [
      mockCollaborationAuthors[0],
      mockCollaborationAuthors[2],
    ],
    updatedAt: '2026-11-10T09:00:00',
    unreadMessages: 1,
  },
]

// --------------------------------------------------
// Collaboration requests
// --------------------------------------------------

export const mockCollaborationRequests: CollaborationRequest[] = [
  {
    id: 'request-1',
    author: mockCollaborationAuthors[1],
    projectTitle: 'Public Infrastructure Accountability',
    message:
      'I would love to contribute research and data analysis to this investigation.',
    direction: 'incoming',
    status: 'pending',
    createdAt: '2026-11-12T10:00:00',
  },
  {
    id: 'request-2',
    author: mockCollaborationAuthors[2],
    projectTitle: 'Digital Privacy and Consumer Rights',
    message:
      'I can help review sources and verify the claims in this project.',
    direction: 'outgoing',
    status: 'pending',
    createdAt: '2026-11-11T14:00:00',
  },
]

// --------------------------------------------------
// Collaboration activity
// --------------------------------------------------

export const mockCollaborationActivity: CollaborationActivity[] = [
  {
    id: 'activity-1',
    author: mockCollaborationAuthors[0],
    action: 'updated the research notes in',
    target: 'Research Notes',
    projectTitle: 'Public Infrastructure Accountability',
    createdAt: '2026-11-12T15:30:00',
    type: 'document',
  },
  {
    id: 'activity-2',
    author: mockCollaborationAuthors[2],
    action: 'added a source for review in',
    target: 'Source Library',
    projectTitle: 'Digital Privacy and Consumer Rights',
    createdAt: '2026-11-12T12:15:00',
    type: 'document',
  },
  {
    id: 'activity-3',
    author: mockCollaborationAuthors[1],
    action: 'left a comment in',
    target: 'Discussion',
    projectTitle: 'The Cost of Healthcare Access',
    createdAt: '2026-11-11T16:45:00',
    type: 'comment',
  },
  {
    id: 'activity-4',
    author: mockCollaborationAuthors[0],
    action: 'started collaborating on',
    target: 'Investigation',
    projectTitle: 'Public Infrastructure Accountability',
    createdAt: '2026-11-10T11:00:00',
    type: 'member',
  },
]

// --------------------------------------------------
// Collaboration statistics
// --------------------------------------------------

export const mockCollaborationStats: CollaborationStats = {
  activeCollaborations: 3,
  pendingRequests: 1,
  invitations: 1,
  unreadMessages: 4,
}
