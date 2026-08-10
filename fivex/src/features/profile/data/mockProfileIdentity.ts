
import type {
  ProfileIdentityData,
  VerificationDocument,
  VerificationEvent,
  ProfileIdentity,
} from '@/features/profile/types/profileIdentity.types'

export const mockProfileIdentity: ProfileIdentityData = {
  profile: {
    id: 'author-001',
    displayName: 'Jordan Mitchell',
    username: '@jordanmitchell',
    email: 'jordan.mitchell@example.com',
    avatarUrl: undefined,
    bio: 'Investigative journalist focused on accountability, public records, and evidence-based reporting.',
    location: 'Denver, Colorado',
    joinedAt: '2025-03-14',
    role: 'author',
    profileCompletion: 86,
    verificationStatus: 'verified',
    verificationLevel: 'Verified Author',
    verifiedAt: '2025-04-02',
  },

  documents: [
    {
      id: 'doc-001',
      type: 'government_id',
      name: 'Government-issued identification',
      status: 'verified',
      submittedAt: '2025-03-28',
      reviewedAt: '2025-04-02',
      note: 'Identity successfully verified.',
    },
    {
      id: 'doc-002',
      type: 'proof_of_address',
      name: 'Proof of address',
      status: 'verified',
      submittedAt: '2025-03-29',
      reviewedAt: '2025-04-02',
      note: 'Address verification completed.',
    },
    {
      id: 'doc-003',
      type: 'professional_credentials',
      name: 'Professional journalism credentials',
      status: 'pending',
      submittedAt: '2025-04-04',
      note: 'Credentials are currently being reviewed.',
    },
  ],

  timeline: [
    {
      id: 'event-001',
      title: 'Profile created',
      description: 'Your author profile was created.',
      date: '2025-03-14',
      status: 'completed',
    },
    {
      id: 'event-002',
      title: 'Identity documents submitted',
      description: 'Required identity documents were submitted for review.',
      date: '2025-03-28',
      status: 'completed',
    },
    {
      id: 'event-003',
      title: 'Identity verified',
      description: 'Your identity was successfully verified.',
      date: '2025-04-02',
      status: 'completed',
    },
    {
      id: 'event-004',
      title: 'Professional credentials submitted',
      description: 'Your professional credentials are awaiting review.',
      date: '2025-04-04',
      status: 'pending',
    },
  ],
}

