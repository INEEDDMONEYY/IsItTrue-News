import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authorSettingsApi, type AuthorProfileApi } from '../api/authorSettings.api'
import type {
  AuthorSettings,
  AuthorProfileSettings,
  AuthorExpertiseSettings,
  AuthorPublishingSettings,
  AuthorNotificationPreferences,
} from '../types/authorSettings.types'

const DEFAULT_SETTINGS: AuthorSettings = {
  profile: {
    displayName: '',
    professionalName: '',
    bio: '',
    location: '',
    website: '',
    profileImage: '',
    bannerImage: '',
    socialLinks: {
      twitter: '',
      linkedin: '',
      instagram: '',
    },
  },

  expertise: {
    primaryBeats: [],
    secondaryBeats: [],
    areasOfExpertise: [],
    geographicCoverage: [],
    languages: [],
    yearsOfExperience: 0,
  },

  publishing: {
    defaultCategory: '',
    defaultVisibility: 'draft',
    factCheckingEnabled: true,
    sourceAttributionEnabled: true,
    allowEditorialSuggestions: true,
  },

  preferences: {
    editorialUpdates: true,
    assignmentNotifications: true,
    revisionNotifications: true,
    collaborationNotifications: true,
    investigationNotifications: true,
  },

  status: {
    status: 'active',
    editorialStatus: 'good-standing',
    factCheckAccess: true,
    investigationAccess: true,
  },
}

// The backend stores author profile fields flat (see AuthorProfileApi) and
// derives editorial "status" from the user's role rather than persisting it
// — so `status` here is computed, not round-tripped to the server.
function fromApi(name: string, role: string, profile: AuthorProfileApi): AuthorSettings {
  const hasEditorialAccess = role === 'author' || role === 'editor' || role === 'admin'

  return {
    profile: {
      displayName: name,
      professionalName: profile.professionalName ?? name,
      bio: profile.bio ?? '',
      location: profile.location ?? '',
      website: profile.website ?? '',
      profileImage: profile.profileImage ?? '',
      bannerImage: profile.bannerImage ?? '',
      socialLinks: {
        twitter: profile.socialLinks?.twitter ?? '',
        linkedin: profile.socialLinks?.linkedin ?? '',
        instagram: profile.socialLinks?.instagram ?? '',
      },
    },
    expertise: {
      primaryBeats: profile.primaryBeats ?? [],
      secondaryBeats: profile.secondaryBeats ?? [],
      areasOfExpertise: profile.areasOfExpertise ?? [],
      geographicCoverage: profile.geographicCoverage ?? [],
      languages: profile.languages ?? [],
      yearsOfExperience: profile.yearsOfExperience ?? 0,
    },
    publishing: {
      defaultCategory: profile.defaultCategory ?? '',
      defaultVisibility: profile.defaultVisibility ?? 'draft',
      factCheckingEnabled: profile.factCheckingEnabled ?? true,
      sourceAttributionEnabled: profile.sourceAttributionEnabled ?? true,
      allowEditorialSuggestions: profile.allowEditorialSuggestions ?? true,
    },
    preferences: {
      editorialUpdates: profile.editorialUpdates ?? true,
      assignmentNotifications: profile.assignmentNotifications ?? true,
      revisionNotifications: profile.revisionNotifications ?? true,
      collaborationNotifications: profile.collaborationNotifications ?? true,
      investigationNotifications: profile.investigationNotifications ?? true,
    },
    status: {
      status: 'active',
      editorialStatus: 'good-standing',
      factCheckAccess: hasEditorialAccess,
      investigationAccess: hasEditorialAccess,
    },
  }
}

function toApi(settings: AuthorSettings): Partial<AuthorProfileApi> {
  return {
    professionalName: settings.profile.professionalName,
    bio: settings.profile.bio,
    location: settings.profile.location,
    website: settings.profile.website,
    profileImage: settings.profile.profileImage,
    bannerImage: settings.profile.bannerImage,
    socialLinks: settings.profile.socialLinks,
    primaryBeats: settings.expertise.primaryBeats,
    secondaryBeats: settings.expertise.secondaryBeats,
    areasOfExpertise: settings.expertise.areasOfExpertise,
    geographicCoverage: settings.expertise.geographicCoverage,
    languages: settings.expertise.languages,
    yearsOfExperience: settings.expertise.yearsOfExperience,
    defaultCategory: settings.publishing.defaultCategory,
    defaultVisibility: settings.publishing.defaultVisibility,
    factCheckingEnabled: settings.publishing.factCheckingEnabled,
    sourceAttributionEnabled: settings.publishing.sourceAttributionEnabled,
    allowEditorialSuggestions: settings.publishing.allowEditorialSuggestions,
    editorialUpdates: settings.preferences.editorialUpdates,
    assignmentNotifications: settings.preferences.assignmentNotifications,
    revisionNotifications: settings.preferences.revisionNotifications,
    collaborationNotifications: settings.preferences.collaborationNotifications,
    investigationNotifications: settings.preferences.investigationNotifications,
  }
}

export function useAuthorSettings() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['authors', 'settings', 'mine'],
    queryFn: authorSettingsApi.getMine,
  })

  const [settings, setSettings] = useState<AuthorSettings>(DEFAULT_SETTINGS)

  // Seed local editable state once the real profile has loaded, without
  // clobbering in-progress edits on every background refetch.
  useEffect(() => {
    if (data) {
      setSettings(fromApi(data.name, data.role, data.authorProfile))
    }
  }, [data])

  const updateProfile = (
    updates: Partial<AuthorProfileSettings>,
  ) => {
    setSettings((current) => ({
      ...current,
      profile: {
        ...current.profile,
        ...updates,
      },
    }))
  }

  const updateExpertise = (
    updates: Partial<AuthorExpertiseSettings>,
  ) => {
    setSettings((current) => ({
      ...current,
      expertise: {
        ...current.expertise,
        ...updates,
      },
    }))
  }

  const updatePublishing = (
    updates: Partial<AuthorPublishingSettings>,
  ) => {
    setSettings((current) => ({
      ...current,
      publishing: {
        ...current.publishing,
        ...updates,
      },
    }))
  }

  const updatePreferences = (
    updates: Partial<AuthorNotificationPreferences>,
  ) => {
    setSettings((current) => ({
      ...current,
      preferences: {
        ...current.preferences,
        ...updates,
      },
    }))
  }

  const saveMutation = useMutation({
    mutationFn: async (next: AuthorSettings) => {
      const nameChanged = data && next.profile.displayName !== data.name
      await Promise.all([
        authorSettingsApi.updateProfile(toApi(next)),
        nameChanged ? authorSettingsApi.updateName(next.profile.displayName) : Promise.resolve(),
      ])
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['authors', 'settings', 'mine'] }),
  })

  const saveSettings = async () => {
    await saveMutation.mutateAsync(settings)
    return settings
  }

  return {
    settings,
    isLoading,
    isSaving: saveMutation.isPending,
    updateProfile,
    updateExpertise,
    updatePublishing,
    updatePreferences,
    saveSettings,
  }
}