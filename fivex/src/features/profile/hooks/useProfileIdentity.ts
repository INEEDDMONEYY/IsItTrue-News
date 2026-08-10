
import { useMemo, useState } from 'react'

import { mockProfileIdentity } from '@/features/profile/data/mockProfileIdentity'
import type {
  ProfileIdentityData,
  VerificationDocument,
  VerificationStatus,
} from '@/features/profile/types/profileIdentity.types'

interface UseProfileIdentityReturn {
  data: ProfileIdentityData
  profile: ProfileIdentityData['profile']
  documents: VerificationDocument[]
  timeline: ProfileIdentityData['timeline']
  verificationStatus: VerificationStatus
  profileCompletion: number
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
    verificationStatus: data.profile.verificationStatus,
    profileCompletion: data.profile.profileCompletion,
    refresh,
  }
}

