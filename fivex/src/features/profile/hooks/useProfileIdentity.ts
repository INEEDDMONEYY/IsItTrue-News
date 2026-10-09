
import { useMemo, useState } from 'react'

import { mockProfileIdentity } from '@/features/profile/data/mockProfileIdentity'
import type {
  ProfileIdentityData,
  VerificationDocument,
  VerificationStatus,
} from '@/features/profile/types/profileIdentity.types'

interface ProfileVerification {
  status: VerificationStatus
  level: string
  verifiedAt?: string
}

interface UseProfileIdentityReturn {
  data: ProfileIdentityData
  profile: ProfileIdentityData['profile']
  documents: VerificationDocument[]
  timeline: ProfileIdentityData['timeline']
  verification: ProfileVerification
  verificationStatus: VerificationStatus
  profileCompletion: number
  // The profile is mock-backed today, so it is always available; these exist so the page keeps working
  // unchanged once the data comes from the API.
  isLoading: boolean
  error: Error | null
  refresh: () => void
}

export function useProfileIdentity(): UseProfileIdentityReturn {
  const [version, setVersion] = useState(0)

  const data = useMemo(() => {
    void version

    return mockProfileIdentity
  }, [version])

  const refresh = () => {
    setVersion((current) => current + 1)
  }

  return {
    data,
    profile: data.profile,
    documents: data.documents,
    timeline: data.timeline,
    verification: {
      status: data.profile.verificationStatus,
      level: data.profile.verificationLevel,
      verifiedAt: data.profile.verifiedAt,
    },
    verificationStatus: data.profile.verificationStatus,
    profileCompletion: data.profile.profileCompletion,
    isLoading: false,
    error: null,
    refresh,
  }
}

